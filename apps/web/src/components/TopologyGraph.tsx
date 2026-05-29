'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TopologyLayoutEngine, Node, Edge } from '@/lib/topology/graph-layout';

export const TopologyGraph: React.FC<{ topology: any }> = ({ topology }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const engine = useRef(new TopologyLayoutEngine());

  useEffect(() => {
    engine.current.updateTopology(topology);
    setNodes(engine.current.getNodes());
    setEdges(engine.current.getEdges());
  }, [topology]);

  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      <svg className="w-full h-full">
        {edges.map((edge, i) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <motion.line
              key={`${edge.source}-${edge.target}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#475569"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          );
        })}
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ x: node.x, y: node.y, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <circle
              r="20"
              fill={node.type === 'ROUTER' ? '#3b82f6' : node.state === 'HEALTHY' ? '#22c55e' : '#ef4444'}
              className="drop-shadow-lg"
            />
            <text
              y="35"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              className="font-mono"
            >
              {node.id}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
};
