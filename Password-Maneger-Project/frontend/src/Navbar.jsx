import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Flex, Box, Heading, Text, Link, Separator, Button, MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import { useLang } from './LangContext';
import { Lock, Upload, Table, Settings, LogOut, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'nav.passwords', icon: Table },
  { path: '/upload', label: 'nav.upload', icon: Upload },
  { path: '/settings', label: 'nav.settings', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Box as="nav" borderBottomWidth="1px" bg="bg.panel" px={6} py={3}>
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <Flex align="center" gap={2}>
          <Lock size={22} />
          <Heading size="md" as={RouterLink} to="/dashboard" css={{ textDecoration: 'none' }}>
            {t('app.name')}
          </Heading>
        </Flex>
        <Flex align="center" gap={1}>
          {!user?.is_admin && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                as={RouterLink}
                to={item.path}
                css={{ textDecoration: 'none' }}
                px={3}
                py={2}
                borderRadius="md"
                bg={isActive ? 'bg.emphasized' : 'transparent'}
                _hover={{ bg: 'bg.emphasized' }}
                display="flex"
                alignItems="center"
                gap={2}
                fontSize="sm"
              >
                <Icon size={16} />
                {t(item.label)}
              </Link>
            );
          })}
          <Separator orientation="vertical" height="24px" mx={2} />
          <MenuRoot>
            <MenuTrigger>
              <Button variant="ghost" size="sm" display="flex" alignItems="center" gap={2} px={2}>
                <Flex bg="blue.500" color="white" borderRadius="full" w="28px" h="28px" align="center" justify="center" fontSize="sm" fontWeight="bold">
                  {initial}
                </Flex>
                <Text fontSize="sm" fontWeight="medium">{user?.username}</Text>
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="profile" onClick={() => navigate('/profile')}>
                <User size={16} />
                {t('nav.profile')}
              </MenuItem>
              {user?.is_admin && (
                <MenuItem value="settings" onClick={() => navigate('/settings')}>
                  <Settings size={16} />
                  {t('nav.settings')}
                </MenuItem>
              )}
              <MenuSeparator />
              <MenuItem value="logout" onClick={logout}>
                <LogOut size={16} />
                {t('nav.logout')}
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Flex>
      </Flex>
    </Box>
  );
}
