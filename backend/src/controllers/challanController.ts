import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

export const getChallans = async (req: Request, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, businessName: true } },
        user: { select: { name: true } },
      }
    });
    res.json(challans);
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChallanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
        customer: true,
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!challan) return res.status(404).json({ error: 'Challan not found' });
    res.json(challan);
  } catch (error) {
    console.error('Error fetching challan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and items array are required' });
    }

    // Generate challan number
    const count = await prisma.challan.count();
    const challanNumber = `CHL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let totalQuantity = 0;
    const challanItemsData: any[] = [];

    // Verify products and build snapshot data
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      totalQuantity += item.quantity;
      challanItemsData.push({
        productId: product.id,
        productSnapshotName: product.name,
        productSnapshotSku: product.sku,
        productSnapshotPrice: product.unitPrice,
        quantity: item.quantity
      });
    }

    const newChallan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: Number(customerId),
        totalQuantity,
        status: 'DRAFT',
        createdBy: req.user!.userId,
        items: {
          create: challanItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json(newChallan);
  } catch (error) {
    console.error('Error creating challan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!challan) return res.status(404).json({ error: 'Challan not found' });
    if (challan.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT challans can be confirmed' });
    }

    // Transaction for confirming challan and reducing stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify all stock is sufficient
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (SKU: ${product.sku})`);
        }
      }

      // 2. Reduce stock and create movements
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity }
          }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Sales Challan #${challan.challanNumber}`,
            createdBy: req.user!.userId
          }
        });
      }

      // 3. Update challan status
      const updatedChallan = await tx.challan.update({
        where: { id: challan.id },
        data: { status: 'CONFIRMED' }
      });

      return updatedChallan;
    });

    res.json({ message: 'Challan confirmed successfully', challan: result });
  } catch (error: any) {
    console.error('Error confirming challan:', error);
    // Return specific error message if it was thrown in transaction
    if (error.message && error.message.includes('Insufficient stock')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
