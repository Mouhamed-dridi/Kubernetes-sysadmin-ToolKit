import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Flex, Box, Heading, Text, Link, Separator, Button, MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import { Lock, Upload, Table, Settings, LogOut, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Passwords', icon: Table },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';
  const visibleItems = user?.is_admin ? navItems.filter(i => i.path !== '/upload') : navItems;

  return (
    <Box as="nav" borderBottomWidth="1px" bg="bg.panel" px={6} py={3}>
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <Flex align="center" gap={2}>
          <Lock size={22} />
          <Heading size="md" as={RouterLink} to="/dashboard" css={{ textDecoration: 'none' }}>
            Password Manager
          </Heading>
        </Flex>
        <Flex align="center" gap={1}>
          {visibleItems.map((item) => {
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
                {item.label}
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
                Profile
              </MenuItem>
              <MenuSeparator />
              <MenuItem value="logout" onClick={logout}>
                <LogOut size={16} />
                Logout
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Flex>
      </Flex>
    </Box>
  );
}
