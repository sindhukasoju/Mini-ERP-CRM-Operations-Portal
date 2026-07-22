import { Request, Response } from 'express';
import { prisma } from '../server';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: String(search) } },
          { businessName: { contains: String(search) } },
          { mobile: { contains: String(search) } }
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });
    
    // Also return total count for pagination metadata
    const total = await prisma.customer.count({ where: whereClause });
    
    res.json({
      data: customers,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;
    
    // Basic validation
    if (!name || !mobile || !businessName || !type || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        type, // 'RETAIL', 'WHOLESALE', 'DISTRIBUTOR'
        address,
        status: status || 'ACTIVE', // 'LEAD', 'ACTIVE', 'INACTIVE'
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes
      }
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
