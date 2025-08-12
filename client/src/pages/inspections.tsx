import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function InspectionsPage() {
  const [inspections] = useState([
    {
      id: "INS-001",
      product: "Lavadora Pro 3000",
      inspector: "João Silva",
      date: "2025-01-15",
      status: "completed",
      result: "approved",
      defects: 0,
      photos: 5,
      videos: 2
    },
    {
      id: "INS-002",
      product: "Aspirador Compact",
      inspector: "Maria Santos",
      date: "2025-01-14",
      status: "pending",
      result: "pending",
      defects: 2,
      photos: 3,
      videos: 1
    },
    {
      id: "INS-003",
      product: "Liquidificador Turbo",
      inspector: "Pedro Costa",
      date: "2025-01-13",
      status: "completed",
      result: "rejected",
      defects: 5,
      photos: 8,
      videos: 3
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Reprovado</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inspeções de Qualidade</h1>
            <p className="text-gray-600 mt-2">Gerencie e acompanhe todas as inspeções de qualidade</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Inspeção
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Inspeções</p>
                <p className="text-2xl font-bold text-blue-900">1,234</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-900">1,089</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Reprovadas</p>
                <p className="text-2xl font-bold text-red-900">145</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">23</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inspections Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Inspeções Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Inspetor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Defeitos</TableHead>
                  <TableHead>Mídia</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((inspection, index) => (
                  <motion.tr
                    key={inspection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{inspection.id}</TableCell>
                    <TableCell>{inspection.product}</TableCell>
                    <TableCell>{inspection.inspector}</TableCell>
                    <TableCell>{inspection.date}</TableCell>
                    <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                    <TableCell>{getResultBadge(inspection.result)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inspection.defects === 0 
                          ? 'bg-green-100 text-green-800' 
                          : inspection.defects <= 2 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inspection.defects}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          📷 {inspection.photos} | 🎥 {inspection.videos}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
