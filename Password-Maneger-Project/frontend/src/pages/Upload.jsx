import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Heading, Text, Button, Stack, TableRoot, TableBody,
  TableRow, TableCell, TableHeader, TableColumnHeader,
  AlertRoot, AlertIndicator, AlertContent, AlertTitle, AlertDescription,
  Separator, Center
} from '@chakra-ui/react';
import { Upload as UploadIcon, FileText, CheckCircle, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { uploadPasswords } from '../api';
import { usePasswords } from '../PasswordsContext';

function looksLikeData(val) {
  if (!val) return false;
  return /^https?:\/\//i.test(val) || /@/.test(val) || /\d/.test(val) || val.length > 10;
}

function detectColumns(headers, firstRow) {
  const h = headers.map((h) => h.toLowerCase().trim());
  const siteKey = h.find((c) => /^(site|url|website|title|service|app|platform)$/i.test(c));
  const loginKey = h.find((c) => /login|username|email|user|account/i.test(c));
  const passKey = h.find((c) => /pass|password|secret|key/i.test(c));
  if (loginKey && passKey) return { mode: 'header', siteKey, loginKey, passKey };
  if (firstRow && firstRow.length >= 2 && firstRow.every((v) => !looksLikeData(v))) {
    return null;
  }
  return null;
}

export default function Upload() {
  const navigate = useNavigate();
  const { refreshPasswords } = usePasswords();
  const inputRef = useRef(null);
  const [parsedData, setParsedData] = useState([]);
  const [detected, setDetected] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFile = (file) => {
    setError('');
    setSuccess('');
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }
        const cols = Object.keys(results.data[0]);
        const colInfo = detectColumns(cols);
        if (colInfo) {
          setDetected(colInfo);
          setParsedData(results.data);
          return;
        }
        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          complete: (r2) => {
            if (r2.data.length === 0) {
              setError('CSV file is empty');
              return;
            }
            const first = r2.data[0];
            if (first.length < 2) {
              setError('CSV must have at least 2 columns (login, password)');
              return;
            }
            setDetected({
              mode: 'positional',
              siteIdx: first.length >= 3 ? 0 : -1,
              loginIdx: first.length >= 3 ? 1 : 0,
              passIdx: first.length >= 3 ? 2 : 1,
            });
            setParsedData(r2.data);
          },
        });
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const getSite = (row) => {
    if (!detected) return '';
    if (detected.mode === 'header') {
      return detected.siteKey ? (row[detected.siteKey] || '') : '';
    }
    return detected.siteIdx >= 0 ? (row[detected.siteIdx] || '') : '';
  };

  const getLogin = (row) => {
    if (!detected) return '';
    if (detected.mode === 'header') {
      return row[detected.loginKey] || '';
    }
    return row[detected.loginIdx] || '';
  };

  const getPassword = (row) => {
    if (!detected) return '';
    if (detected.mode === 'header') {
      return row[detected.passKey] || '';
    }
    return row[detected.passIdx] || '';
  };

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    try {
      const items = parsedData.map((row) => ({
        title: getSite(row) || fileName.replace(/\.csv$/i, ''),
        login: getLogin(row),
        password: getPassword(row),
      }));
      await uploadPasswords(items);
      await refreshPasswords();
      setSuccess(`Successfully uploaded ${items.length} passwords`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearData = () => {
    setParsedData([]);
    setDetected(null);
    setFileName('');
    setError('');
    setSuccess('');
  };

  if (success) {
    return (
      <Center minH="60vh">
        <Stack align="center" gap={4}>
          <CheckCircle size={48} color="green" />
          <Heading size="lg">{success}</Heading>
          <Text>Redirecting to dashboard...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Container maxW="800px" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="lg" mb={2}>Upload Passwords</Heading>
          <Text color="fg.muted">Upload a CSV file containing your logins and passwords</Text>
        </Box>

        {error && (
          <AlertRoot status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        {parsedData.length === 0 ? (
          <Box
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="border"
            borderRadius="xl"
            p={12}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'blue.500', bg: 'bg.subtle' }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <UploadIcon size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <Heading size="md" mb={1}>Drop your CSV file here</Heading>
            <Text color="fg.muted" mb={4}>or click to browse</Text>
            <Button variant="outline">Select CSV File</Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleSelect}
            />
            <Text fontSize="sm" color="fg.muted" mt={4}>
              Supports CSV with or without headers
            </Text>
          </Box>
        ) : (
          <>
            <Stack direction="row" align="center" justify="space-between">
              <Stack direction="row" align="center" gap={2}>
                <FileText size={20} />
                <Text fontWeight="medium">{fileName}</Text>
                <Text color="fg.muted">({parsedData.length} entries)</Text>
              </Stack>
              <Stack direction="row" gap={2}>
                <Button variant="outline" onClick={clearData} display="flex" alignItems="center" gap={2}>
                  <Trash2 size={16} />
                  Clear
                </Button>
                <Button colorScheme="blue" onClick={handleUpload} disabled={uploading} loading={uploading}>
                  Upload to Vault
                </Button>
              </Stack>
            </Stack>

            <Separator />

            <Box overflowX="auto">
              <TableRoot>
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>Site</TableColumnHeader>
                    <TableColumnHeader>Login</TableColumnHeader>
                    <TableColumnHeader>Password</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell fontWeight="medium">{getSite(row) || '—'}</TableCell>
                      <TableCell>{getLogin(row)}</TableCell>
                      <TableCell color="fg.muted">••••••••</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </Box>
            {parsedData.length > 10 && (
              <Text fontSize="sm" color="fg.muted" textAlign="center">
                Showing first 10 of {parsedData.length} entries
              </Text>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
