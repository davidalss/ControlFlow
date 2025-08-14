import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  Calendar,
  Award
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructor: string;
  rating: number;
  enrolledStudents: number;
  maxStudents: number;
  status: 'available' | 'in_progress' | 'completed' | 'full';
  progress?: number;
  startDate?: string;
  endDate?: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Controle de Qualidade Básico',
    description: 'Fundamentos do controle de qualidade em processos industriais',
    duration: '8 horas',
    level: 'beginner',
    category: 'Qualidade',
    instructor: 'Maria Santos',
    rating: 4.8,
    enrolledStudents: 45,
    maxStudents: 50,
    status: 'available'
  },
  {
    id: '2',
    title: 'Inspeção de Produtos Avançada',
    description: 'Técnicas avançadas de inspeção e análise de produtos',
    duration: '12 horas',
    level: 'advanced',
    category: 'Inspeção',
    instructor: 'João Silva',
    rating: 4.9,
    enrolledStudents: 30,
    maxStudents: 35,
    status: 'in_progress',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-02-15'
  },
  {
    id: '3',
    title: 'Gestão de Fornecedores',
    description: 'Como gerenciar e avaliar fornecedores de forma eficiente',
    duration: '6 horas',
    level: 'intermediate',
    category: 'Gestão',
    instructor: 'Ana Costa',
    rating: 4.7,
    enrolledStudents: 50,
    maxStudents: 50,
    status: 'full'
  },
  {
    id: '4',
    title: 'Normas ISO 9001',
    description: 'Implementação e manutenção do sistema de qualidade ISO 9001',
    duration: '10 horas',
    level: 'intermediate',
    category: 'Certificação',
    instructor: 'Carlos Lima',
    rating: 4.6,
    enrolledStudents: 25,
    maxStudents: 40,
    status: 'available'
  },
  {
    id: '5',
    title: 'Análise de Dados SPC',
    description: 'Controle estatístico de processos e análise de dados',
    duration: '14 horas',
    level: 'advanced',
    category: 'Estatística',
    instructor: 'Fernanda Rocha',
    rating: 4.9,
    enrolledStudents: 20,
    maxStudents: 30,
    status: 'completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }
];

export default function CoursesPage() {
  const getLevelBadge = (level: string) => {
    const variants = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[level as keyof typeof variants]}>{level}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      full: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: 'Disponível',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      full: 'Lotado'
    };
    return texts[status as keyof typeof texts];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cursos Disponíveis</h1>
          <p className="text-gray-600">Explore e inscreva-se nos cursos de treinamento</p>
        </div>
        <Button className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Meus Cursos
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Cursos</p>
                <p className="text-2xl font-bold">{mockCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockCourses.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockCourses.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockCourses.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {getLevelBadge(course.level)}
                    {getStatusBadge(course.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{course.enrolledStudents}/{course.maxStudents} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{course.rating} ({course.rating >= 4.5 ? 'Excelente' : 'Bom'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>{course.instructor}</span>
                </div>
              </div>

              {/* Progress Bar (if in progress) */}
              {course.status === 'in_progress' && course.progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-2">
                {course.status === 'available' && (
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Inscrever-se
                  </Button>
                )}
                {course.status === 'in_progress' && (
                  <Button className="flex-1" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                )}
                {course.status === 'completed' && (
                  <Button className="flex-1" variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Ver Certificado
                  </Button>
                )}
                {course.status === 'full' && (
                  <Button className="flex-1" variant="outline" disabled>
                    <Users className="h-4 w-4 mr-2" />
                    Lista de Espera
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
