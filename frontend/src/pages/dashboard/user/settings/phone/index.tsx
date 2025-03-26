import type { NextPage } from 'next';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '@/types/next';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layouts/UserLayout';
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { PhoneIcon, ArrowBackIcon } from '@chakra-ui/icons';
import Head from 'next/head';
import { useCompany } from '@/hooks/useCompany';
import { api } from '@/services/api';

const PhoneNumberPage: NextPageWithLayout = () => {
  const router = useRouter();
  const toast = useToast();
  const { company, loading: companyLoading, refreshCompany } = useCompany();
  
  const [provider, setProvider] = useState<string>('fonoster');
  const [country, setCountry] = useState<string>('FR');
  const [areaCode, setAreaCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  
  // Vérifier si l'entreprise a déjà un numéro
  const hasFonosterNumber = company?.fonosterPhoneNumber;
  const hasTwilioNumber = company?.twilioPhoneNumber;
  const hasPhoneNumber = hasFonosterNumber || hasTwilioNumber;
  
  // Si un numéro existe, commencer à l'étape de gestion plutôt qu'à l'étape d'achat
  useEffect(() => {
    if (!companyLoading && hasPhoneNumber) {
      setStep(3);
    }
  }, [companyLoading, hasPhoneNumber]);
  
  // Fonction pour rechercher des numéros disponibles
  const searchAvailableNumbers = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.get(`/phone-numbers/available?provider=${provider}&country=${country}${areaCode ? `&areaCode=${areaCode}` : ''}`);
      
      setAvailableNumbers(response.data.numbers || []);
      setStep(2);
      
      if (response.data.numbers?.length === 0) {
        toast({
          title: 'Aucun numéro disponible',
          description: 'Essayez de modifier vos critères de recherche.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de numéros:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rechercher des numéros disponibles. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour acheter un numéro
  const purchaseNumber = async () => {
    if (!selectedNumber && !hasPhoneNumber) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner un numéro de téléphone.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await api.post(`/companies/${company?._id}/phone-number`, {
        phoneNumber: selectedNumber,
        provider,
        country,
        areaCode,
        replace: hasPhoneNumber // Si on a déjà un numéro, on le remplace
      });
      
      toast({
        title: 'Succès!',
        description: 'Votre numéro de téléphone a été configuré avec succès.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setStep(3);
      refreshCompany(); // Rafraîchir les données de l'entreprise
    } catch (error) {
      console.error('Erreur lors de l\'achat du numéro:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'acheter ce numéro. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Numéro de téléphone | Lydia Voice AI</title>
      </Head>
      
      <Box p={6}>
        <Flex alignItems="center" mb={6}>
          <Button 
            leftIcon={<ArrowBackIcon />} 
            variant="ghost" 
            onClick={() => router.push('/dashboard/user/settings')}
            mr={4}
          >
            Retour
          </Button>
          <Box>
            <Heading size="lg">Numéro de téléphone</Heading>
            <Text color="gray.600">Configurez le numéro de téléphone de votre assistant vocal</Text>
          </Box>
        </Flex>
        
        <Divider my={6} />
        
        {companyLoading ? (
          <Text>Chargement...</Text>
        ) : (
          <>
            {step === 1 && (
              <Card p={6} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={4}>Rechercher un numéro disponible</Heading>
                
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Fournisseur</FormLabel>
                    <RadioGroup value={provider} onChange={setProvider}>
                      <Stack direction="row" spacing={4}>
                        <Radio value="fonoster">Fonoster</Radio>
                        <Radio value="twilio">Twilio</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Pays</FormLabel>
                    <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Indicatif régional (optionnel)</FormLabel>
                    <Input 
                      placeholder="Ex: 01 pour Paris" 
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value)}
                    />
                  </FormControl>
                  
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<PhoneIcon />}
                    onClick={searchAvailableNumbers}
                    isLoading={isLoading}
                    loadingText="Recherche..."
                  >
                    Rechercher des numéros
                  </Button>
                </Stack>
              </Card>
            )}
            
            {step === 2 && (
              <Card p={6} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={4}>Sélectionnez un numéro</Heading>
                
                {availableNumbers.length > 0 ? (
                  <>
                    <RadioGroup value={selectedNumber} onChange={setSelectedNumber} mb={4}>
                      <Stack spacing={3}>
                        {availableNumbers.map((number) => (
                          <Radio key={number.phoneNumber} value={number.phoneNumber}>
                            <Text fontWeight="bold">{number.phoneNumber}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {number.location || 'Emplacement non spécifié'} | {provider === 'twilio' ? 'Twilio' : 'Fonoster'}
                            </Text>
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                    
                    <Flex justify="space-between" mt={6}>
                      <Button onClick={() => setStep(1)}>Retour</Button>
                      <Button 
                        colorScheme="blue" 
                        onClick={purchaseNumber}
                        isLoading={isLoading}
                        loadingText="Achat en cours..."
                        isDisabled={!selectedNumber}
                      >
                        Acheter ce numéro
                      </Button>
                    </Flex>
                  </>
                ) : (
                  <Box>
                    <Alert status="info" mb={4}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Aucun numéro disponible</AlertTitle>
                        <AlertDescription>
                          Essayez de modifier vos critères de recherche.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <Button onClick={() => setStep(1)}>Retour</Button>
                  </Box>
                )}
              </Card>
            )}
            
            {step === 3 && (
              <Card p={6} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={4}>Votre numéro de téléphone</Heading>
                
                {hasPhoneNumber ? (
                  <Box>
                    {hasFonosterNumber && (
                      <Flex 
                        p={4} 
                        bg="blue.50" 
                        borderRadius="md" 
                        alignItems="center"
                        mb={4}
                      >
                        <PhoneIcon mr={4} color="blue.500" boxSize={6} />
                        <Box flex="1">
                          <Flex align="center">
                            <Text fontWeight="bold" fontSize="xl">{company?.fonosterPhoneNumber}</Text>
                            <Badge ml={2} colorScheme="blue">Fonoster</Badge>
                          </Flex>
                          <Text fontSize="sm" color="gray.500">
                            Votre numéro virtuel actif via Fonoster
                          </Text>
                        </Box>
                      </Flex>
                    )}
                    
                    {hasTwilioNumber && (
                      <Flex 
                        p={4} 
                        bg="purple.50" 
                        borderRadius="md" 
                        alignItems="center"
                        mb={4}
                      >
                        <PhoneIcon mr={4} color="purple.500" boxSize={6} />
                        <Box flex="1">
                          <Flex align="center">
                            <Text fontWeight="bold" fontSize="xl">{company?.twilioPhoneNumber}</Text>
                            <Badge ml={2} colorScheme="purple">Twilio</Badge>
                          </Flex>
                          <Text fontSize="sm" color="gray.500">
                            Votre numéro virtuel actif via Twilio
                          </Text>
                        </Box>
                      </Flex>
                    )}
                    
                    <Alert status="success" mt={6} mb={4}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Numéro configuré</AlertTitle>
                        <AlertDescription>
                          Votre assistant vocal est maintenant accessible par téléphone.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <Divider my={6} />
                    
                    <Heading size="sm" mb={3}>Remplacer le numéro actuel</Heading>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      Si vous souhaitez changer de numéro, vous pouvez en rechercher un nouveau.
                    </Text>
                    
                    <Button 
                      colorScheme="blue" 
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Rechercher un nouveau numéro
                    </Button>
                  </Box>
                ) : (
                  <Alert status="warning" mb={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Aucun numéro configuré</AlertTitle>
                      <AlertDescription>
                        Vous n'avez pas encore de numéro de téléphone configuré pour votre assistant vocal.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Card>
            )}
          </>
        )}
      </Box>
    </>
  );
};

PhoneNumberPage.getLayout = (page: React.ReactNode) => (
  <UserLayout>{page}</UserLayout>
);

export default PhoneNumberPage; 