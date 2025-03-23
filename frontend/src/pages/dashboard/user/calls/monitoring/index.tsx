import { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import UserLayout from '@/components/layouts/UserLayout';
import callService from '@/services/callService';
import { useCompany } from '@/hooks/useCompany';
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  HStack,
  Alert,
  AlertIcon,
  Skeleton,
  useToast,
  Divider,
  Tag,
  TagLabel,
  Spinner,
  Stack
} from '@chakra-ui/react';
import { PhoneIcon, CalendarIcon, ArrowUpIcon, ArrowDownIcon, InfoIcon } from '@chakra-ui/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CallMonitoringPage: NextPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { company, loading: companyLoading } = useCompany();
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [callStats, setCallStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>(null);
  
  // Charger les données
  useEffect(() => {
    if (!company?._id) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charge les statistiques d'appels
        const stats = await callService.getCallStats(company._id);
        setCallStats(stats);
        
        // Charge les statistiques du tableau de bord
        const dashboard = await callService.getDashboardStats(company._id, period);
        setDashboardStats(dashboard);
        
        // Charge les appels récents
        const callsResponse = await callService.getCallsByCompany(company._id, { 
          limit: 5,
          page: 1
        });
        setRecentCalls(callsResponse.calls || []);
        
        // Préparer les données pour les graphiques
        prepareChartData(dashboard);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du tableau de bord.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [company?._id, period, toast]);
  
  // Préparer les données pour les graphiques
  const prepareChartData = (dashboard: any) => {
    if (!dashboard) return;
    
    // Graphique des appels par jour
    const callsPerDay = {
      labels: dashboard.callsPerDay?.map((item: any) => item.date) || [],
      datasets: [
        {
          label: 'Appels reçus',
          data: dashboard.callsPerDay?.map((item: any) => item.count) || [],
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    
    // Graphique de répartition des statuts
    const callsByStatus = {
      labels: ['Terminés', 'Manqués', 'Transférés'],
      datasets: [
        {
          data: [
            callStats?.completedCalls || 0,
            callStats?.missedCalls || 0,
            callStats?.transferredCalls || 0,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Graphique des sentiments
    const sentimentData = {
      labels: ['Positif', 'Neutre', 'Négatif'],
      datasets: [
        {
          data: [
            callStats?.sentiments?.positif || 0,
            callStats?.sentiments?.neutre || 0,
            callStats?.sentiments?.négatif || 0,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 99, 132)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    setChartData({
      callsPerDay,
      callsByStatus,
      sentimentData
    });
  };
  
  // Formater la durée d'un appel
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <>
      <Head>
        <title>Surveillance des appels | Lydia Voice AI</title>
      </Head>
      
      <Box p={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Heading size="lg">Surveillance des appels</Heading>
            <Text color="gray.600">Suivez en temps réel les statistiques et performances de votre assistant vocal</Text>
          </Box>
          
          <HStack spacing={4}>
            <Select 
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
              width="auto"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </Select>
            
            <Button 
              leftIcon={<CalendarIcon />}
              onClick={() => router.push('/dashboard/user/calls')}
              colorScheme="blue"
              variant="outline"
            >
              Historique des appels
            </Button>
          </HStack>
        </Flex>
        
        <Divider my={6} />
        
        {isLoading || companyLoading ? (
          // Affichage des squelettes de chargement
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
            {Array.from({ length: 4 }).map((_, i) => (
              <GridItem key={i}>
                <Skeleton height="120px" borderRadius="lg" />
              </GridItem>
            ))}
          </Grid>
        ) : (
          // Statistiques principales
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <Flex align="center">
                      <Box p={2} bg="blue.50" borderRadius="md" mr={3}>
                        <PhoneIcon color="blue.500" boxSize={5} />
                      </Box>
                      <Box>
                        <StatLabel>Total des appels</StatLabel>
                        <StatNumber>{callStats?.totalCalls || 0}</StatNumber>
                        <StatHelpText>Tous les appels</StatHelpText>
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <Flex align="center">
                      <Box p={2} bg="green.50" borderRadius="md" mr={3}>
                        <ArrowDownIcon color="green.500" boxSize={5} />
                      </Box>
                      <Box>
                        <StatLabel>Appels complétés</StatLabel>
                        <StatNumber>{callStats?.completedCalls || 0}</StatNumber>
                        <StatHelpText>
                          {callStats?.totalCalls 
                            ? Math.round((callStats.completedCalls / callStats.totalCalls) * 100) 
                            : 0}% du total
                        </StatHelpText>
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <Flex align="center">
                      <Box p={2} bg="red.50" borderRadius="md" mr={3}>
                        <ArrowUpIcon color="red.500" boxSize={5} />
                      </Box>
                      <Box>
                        <StatLabel>Appels manqués</StatLabel>
                        <StatNumber>{callStats?.missedCalls || 0}</StatNumber>
                        <StatHelpText>
                          {callStats?.totalCalls 
                            ? Math.round((callStats.missedCalls / callStats.totalCalls) * 100) 
                            : 0}% du total
                        </StatHelpText>
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <Flex align="center">
                      <Box p={2} bg="orange.50" borderRadius="md" mr={3}>
                        <InfoIcon color="orange.500" boxSize={5} />
                      </Box>
                      <Box>
                        <StatLabel>Durée moyenne</StatLabel>
                        <StatNumber>{formatDuration(callStats?.avgDuration || 0)}</StatNumber>
                        <StatHelpText>Par appel</StatHelpText>
                      </Box>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}
        
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6} mb={8}>
          {/* Graphique des appels par jour */}
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Card>
              <CardHeader>
                <Heading size="md">Tendance des appels</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justifyContent="center" alignItems="center" height="200px">
                    <Spinner />
                  </Flex>
                ) : chartData?.callsPerDay?.labels.length > 0 ? (
                  <Box height="300px">
                    <Line 
                      data={chartData.callsPerDay} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: false,
                            text: 'Tendance des appels',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    Pas suffisamment de données pour afficher la tendance des appels.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>
          
          {/* Graphique des statuts d'appels */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Statuts des appels</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justifyContent="center" alignItems="center" height="200px">
                    <Spinner />
                  </Flex>
                ) : callStats && (callStats.completedCalls > 0 || callStats.missedCalls > 0 || callStats.transferredCalls > 0) ? (
                  <Box height="250px">
                    <Pie 
                      data={chartData.callsByStatus}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    Pas suffisamment de données pour afficher les statuts des appels.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        
        <Tabs variant="enclosed" colorScheme="blue" mb={8}>
          <TabList>
            <Tab>Appels récents</Tab>
            <Tab>Analyse du sentiment</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  {isLoading ? (
                    <Stack spacing={4}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height="60px" />
                      ))}
                    </Stack>
                  ) : recentCalls.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Appelant</Th>
                          <Th>Date</Th>
                          <Th>Durée</Th>
                          <Th>Statut</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentCalls.map((call) => (
                          <Tr key={call._id}>
                            <Td>
                              <Text fontWeight="medium">{call.from}</Text>
                            </Td>
                            <Td>{formatDate(call.startTime)}</Td>
                            <Td>{formatDuration(call.duration || 0)}</Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  call.status === 'terminé' ? 'green' : 
                                  call.status === 'manqué' ? 'red' : 
                                  call.status === 'transféré' ? 'orange' : 'blue'
                                }
                              >
                                {call.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Button 
                                size="sm" 
                                colorScheme="blue" 
                                variant="outline"
                                onClick={() => router.push(`/dashboard/user/calls/${call._id}`)}
                              >
                                Détails
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      Aucun appel récent à afficher.
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
            
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
                    <GridItem>
                      <Box mb={4}>
                        <Heading size="md" mb={4}>Analyse des sentiments</Heading>
                        {isLoading ? (
                          <Flex justifyContent="center" alignItems="center" height="200px">
                            <Spinner />
                          </Flex>
                        ) : callStats && (callStats.sentiments.positif > 0 || callStats.sentiments.neutre > 0 || callStats.sentiments.négatif > 0) ? (
                          <Box height="250px">
                            <Pie 
                              data={chartData.sentimentData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom' as const,
                                  }
                                }
                              }}
                            />
                          </Box>
                        ) : (
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            Pas suffisamment de données pour afficher l'analyse des sentiments.
                          </Alert>
                        )}
                      </Box>
                    </GridItem>
                    
                    <GridItem>
                      <Box>
                        <Heading size="md" mb={4}>Interprétation</Heading>
                        <Text mb={4}>
                          L'analyse des sentiments vous permet de comprendre la tonalité générale des conversations avec vos clients.
                        </Text>
                        
                        {!isLoading && callStats && (
                          <Stack spacing={4}>
                            <Flex justify="space-between" align="center">
                              <Tag size="lg" variant="subtle" colorScheme="green">
                                <TagLabel>Positif</TagLabel>
                              </Tag>
                              <Text fontWeight="bold">{callStats.sentiments.positif || 0} appels</Text>
                            </Flex>
                            
                            <Flex justify="space-between" align="center">
                              <Tag size="lg" variant="subtle" colorScheme="purple">
                                <TagLabel>Neutre</TagLabel>
                              </Tag>
                              <Text fontWeight="bold">{callStats.sentiments.neutre || 0} appels</Text>
                            </Flex>
                            
                            <Flex justify="space-between" align="center">
                              <Tag size="lg" variant="subtle" colorScheme="red">
                                <TagLabel>Négatif</TagLabel>
                              </Tag>
                              <Text fontWeight="bold">{callStats.sentiments.négatif || 0} appels</Text>
                            </Flex>
                          </Stack>
                        )}
                      </Box>
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};

CallMonitoringPage.getLayout = (page: React.ReactNode) => (
  <UserLayout>{page}</UserLayout>
);

export default CallMonitoringPage; 