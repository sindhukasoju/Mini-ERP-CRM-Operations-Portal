import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;
    
    if (!name || !sku || !category || unitPrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice: parseFloat(unitPrice),
        currentStock: currentStock ? parseInt(currentStock) : 0,
        minStockAlert: minStockAlert ? parseInt(minStockAlert) : 10,
        location
      }
    });

    if (currentStock && parseInt(currentStock) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: newProduct.id,
          quantity: parseInt(currentStock),
          type: 'IN',
          reason: 'Initial Stock',
          createdBy: req.user!.userId
        }
      });
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.unitPrice) updateData.unitPrice = parseFloat(updateData.unitPrice);
    if (updateData.minStockAlert) updateData.minStockAlert = parseInt(updateData.minStockAlert);
    
    // Do not allow direct stock updates here, it should go through stock movements
    delete updateData.currentStock;

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movements = await prisma.stockMovement.findMany({
      where: { productId: Number(id) },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true } } }
    });
    res.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addStockMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body; // type: 'IN' or 'OUT'
    
    if (!quantity || !type || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const productId = Number(id);
    const qty = parseInt(quantity);
    
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (type === 'OUT' && product.currentStock < qty) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const newStock = type === 'IN' ? product.currentStock + qty : product.currentStock - qty;

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          type,
          reason,
          createdBy: req.user!.userId
        }
      });
      
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      return movement;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding stock movement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
