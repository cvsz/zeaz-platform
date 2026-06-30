import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';

export default async function creditRoutes(app: FastifyInstance) {
  
  app.get<{ Params: { userId: string } }>('/v1/credits/:userId', async (req, reply) => {
    const { userId } = req.params;
    
    let wallet = await prisma.walletBalance.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      wallet = await prisma.walletBalance.create({
        data: { userId, credits: 0 }
      });
    }

    return { userId, credits: wallet.credits };
  });

  app.post<{ Body: { userId: string; amount: number; reason?: string } }>('/v1/credits/add', async (req, reply) => {
    const { userId, amount, reason } = req.body;
    
    if (amount <= 0) {
      return reply.status(400).send({ error: 'Amount must be greater than 0' });
    }

    const wallet = await prisma.walletBalance.upsert({
      where: { userId },
      update: { credits: { increment: amount } },
      create: { userId, credits: amount }
    });

    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'ADD',
        reason
      }
    });

    return { userId, credits: wallet.credits };
  });

  app.post<{ Body: { userId: string; amount: number; reason?: string } }>('/v1/credits/deduct', async (req, reply) => {
    const { userId, amount, reason } = req.body;
    
    if (amount <= 0) {
      return reply.status(400).send({ error: 'Amount must be greater than 0' });
    }

    const wallet = await prisma.walletBalance.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.credits < amount) {
      return reply.status(400).send({ error: 'Insufficient credits available' });
    }

    const updatedWallet = await prisma.walletBalance.update({
      where: { userId },
      data: { credits: { decrement: amount } }
    });

    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'DEDUCT',
        reason
      }
    });

    return { userId, credits: updatedWallet.credits };
  });
}
