import type { NextPage } from 'next';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '@/types/next';
import { useRouter } from 'next/router';
import React from 'react';
import UserLayout from '@/components/layouts/UserLayout';
import { Card, Heading, Text, Badge, Button, Flex, Box, Stack, Divider } from '@chakra-ui/react';
import { PhoneIcon, BellIcon, LockIcon, SettingsIcon, InfoIcon } from '@chakra-ui/icons';
import Head from 'next/head';

const SettingCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  href: string;
}> = ({ title, description, icon, badge, badgeColor = 'blue', href }) => {
  const router = useRouter();
  
  return (
    <Card 
      p={6} 
      shadow="md" 
      borderWidth="1px" 
      borderRadius="lg" 
      cursor="pointer"
      _hover={{ shadow: 'lg', borderColor: 'blue.300' }}
      onClick={() => router.push(href)}
    >
      <Flex alignItems="center" mb={4}>
        <Box 
          bg="blue.50" 
          p={3} 
          borderRadius="md"
          color="blue.500"
          mr={4}
        >
          {icon}
        </Box>
        <Box flex="1">
          <Flex alignItems="center">
            <Heading size="md">{title}</Heading>
            {badge && (
              <Badge ml={2} colorScheme={badgeColor} fontSize="0.8em">
                {badge}
              </Badge>
            )}
          </Flex>
          <Text mt={1} color="gray.600" fontSize="sm">{description}</Text>
        </Box>
      </Flex>
    </Card>
  );
};

const SettingsPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Paramètres | Lydia Voice AI</title>
      </Head>
      
      <Box p={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Heading size="lg">Paramètres</Heading>
            <Text color="gray.600">Gérez les paramètres de votre assistant vocal et de votre compte</Text>
          </Box>
        </Flex>
        
        <Divider my={6} />
        
        <Heading size="md" mb={4}>Paramètres de l'assistant vocal</Heading>
        <Stack spacing={4} mb={8}>
          <SettingCard
            title="Numéro de téléphone"
            description="Configurez et gérez votre numéro de téléphone virtuel"
            icon={<PhoneIcon boxSize={5} />}
            badge="Nouveau"
            badgeColor="green"
            href="/dashboard/user/settings/phone"
          />
          
          <SettingCard
            title="Voix et comportement"
            description="Personnalisez la voix et le comportement de votre assistant vocal"
            icon={<SettingsIcon boxSize={5} />}
            href="/dashboard/user/settings/voice"
          />
          
          <SettingCard
            title="Heures d'ouverture"
            description="Définissez quand votre assistant vocal est disponible"
            icon={<InfoIcon boxSize={5} />}
            href="/dashboard/user/settings/hours"
          />
        </Stack>
        
        <Heading size="md" mb={4}>Paramètres du compte</Heading>
        <Stack spacing={4}>
          <SettingCard
            title="Sécurité"
            description="Gérez vos informations de connexion et les paramètres de sécurité"
            icon={<LockIcon boxSize={5} />}
            href="/dashboard/user/settings/security"
          />
          
          <SettingCard
            title="Notifications"
            description="Configurez vos préférences de notifications"
            icon={<BellIcon boxSize={5} />}
            href="/dashboard/user/settings/notifications"
          />
        </Stack>
      </Box>
    </>
  );
};

SettingsPage.getLayout = (page: React.ReactNode) => (
  <UserLayout>{page}</UserLayout>
);

export default SettingsPage; 