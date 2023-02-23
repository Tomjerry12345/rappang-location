import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { LoadingButton } from '@mui/lab';
import { useReactToPrint } from 'react-to-print';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Box,
  Modal,
  TextField,
  Button,
} from '@mui/material';
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// mock
// import USERLIST from '../_mock/user';
import { db } from '../services/FirebaseServices';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'namaLengkap', label: 'Nama Lengkap', alignRight: false },
  { id: 'jabatan', label: 'Jabatan', alignRight: false },
  { id: 'alamat', label: 'Alamat', alignRight: false },
  { id: 'noHp', label: 'Nomor HP', alignRight: false },
  { id: 'latitude', label: 'Latitude', alignRight: false },
  { id: 'longitude', label: 'Longitude', alignRight: false },
  // { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.namaLengkap.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #fff',
  borderRadius: '8px',
  boxShadow: 24,
  p: 3,
};

const styleView = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  border: '2px solid #fff',
  borderRadius: '8px',
  boxShadow: 24,
  p: 3,
};

export default function UserPage() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('namaLengkap');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openTambahUser, setOpenTambahUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [val, setVal] = useState({
    namaLengkap: '',
    jabatan: '',
    alamat: '',
    noHp: '',
    latitude: '',
    longitude: '',
  });

  const [data, setData] = useState([]);

  const [selectData, setSelectData] = useState({});

  const ref = useRef();

  const url = `${window.location.protocol}//${window.location.hostname}`;

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const list = [];
    let index = 0;
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
      list.push({
        ...doc.data(),
        id: doc.id,
        avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
      });

      index += 1;
    });

    console.log('list', list);
    setData(list);
  };

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-gen');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `test.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleOpenMenu = (event, row) => {
    console.log('row', row);
    setSelectData(row);
    setVal(row);
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
    setSelectData({});
    setVal({});
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const filteredUsers = applySortFilter(data, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setVal({
      ...val,
      [name]: value,
    });
  };

  const onTambahData = async () => {
    setLoading(true);
    console.log('val', val);
    val.noHp = `+62${val.noHp}`
    await addDoc(collection(db, 'users'), val);
    setLoading(false);
    getData();
    alert('Berhasil tambah data');
    onCloseTambahUser();
    handleCloseMenu();
  };

  const onView = () => {
    setOpenView(true);
  };

  const onEdit = () => {
    setOpenEditUser(true);
  };

  const onActionEdit = async () => {
    setLoading(true);
    console.log('edit-val', val);
    await setDoc(doc(db, 'users', selectData.id), val);
    setLoading(false);
    getData();
    alert('Data berhasil Di edit');
    onCloseEditUser();
    handleCloseMenu();
  };

  const onDelete = async () => {
    await deleteDoc(doc(db, 'users', selectData.id));
    alert('Data berhasil Di hapus');
    getData();
    handleCloseMenu();
  };

  const onOpenTambahUser = () => {
    setOpenTambahUser(true);
  };

  const onCloseTambahUser = () => {
    setOpenTambahUser(false);
  };

  const onCloseView = () => {
    setOpenView(false);
  };

  const onCloseEditUser = () => {
    setOpenEditUser(false);
  };

  return (
    <>
      <Helmet>
        <title> User </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={onOpenTambahUser}>
            Tambah Data
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={data.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, avatarUrl, namaLengkap, alamat, jabatan, noHp, latitude, longitude } = row;
                    const selectedUser = selected.indexOf(namaLengkap) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          {/* <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, namaLengkap)} /> */}
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={namaLengkap} src={avatarUrl} />
                            <Typography variant="subtitle2" noWrap>
                              {namaLengkap}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{alamat}</TableCell>

                        <TableCell align="left">{jabatan}</TableCell>

                        <TableCell align="left">{noHp}</TableCell>

                        <TableCell align="left">{latitude}</TableCell>

                        <TableCell align="left">{longitude}</TableCell>
                        {/* 
                        <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label>
                        </TableCell> */}

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(e) => handleOpenMenu(e, row)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={onView}>
          <Iconify icon={'eva:external-link-fill'} sx={{ mr: 2 }} />
          Print
        </MenuItem>

        <MenuItem onClick={onEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={onDelete}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* Tambah User */}
      <Modal
        open={openTambahUser}
        onClose={onCloseTambahUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tambah Data
          </Typography>
          <Box
            sx={{
              marginY: 2,
            }}
          >
            <TextField name="namaLengkap" label="Nama Lengkap" fullWidth onChange={onChange} />
            <TextField sx={{ marginTop: 2 }} name="jabatan" label="Jabatan" fullWidth onChange={onChange} />
            <TextField
              multiline
              rows={2}
              maxRows={2}
              sx={{ marginTop: 2 }}
              name="alamat"
              label="Alamat"
              fullWidth
              onChange={onChange}
            />

            <Box display="flex" sx={{ marginTop: 2 }}>
              <TextField name="noHp" label="+62" disabled sx={{width: 72, marginRight: 2}}/>
              <TextField type="number"  name="noHp" label="No. Hp" fullWidth onChange={onChange} />
            </Box>

            <TextField
              type="number"
              sx={{ marginTop: 2 }}
              name="latitude"
              label="latitude"
              fullWidth
              onChange={onChange}
            />
            <TextField
              type="number"
              sx={{ marginTop: 2 }}
              name="longitude"
              label="longitude"
              fullWidth
              onChange={onChange}
            />
          </Box>

          <LoadingButton loading={loading} loadingPosition="start" variant="contained" fullWidth onClick={onTambahData}>
            Tambah
          </LoadingButton>
        </Box>
      </Modal>

      {/* Edit User */}
      <Modal
        open={openEditUser}
        onClose={onCloseEditUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Data
          </Typography>
          <Box
            sx={{
              marginY: 2,
            }}
          >
            <TextField value={val.namaLengkap} name="namaLengkap" label="Nama Lengkap" fullWidth onChange={onChange} />
            <TextField
              value={val.jabatan}
              sx={{ marginTop: 2 }}
              name="jabatan"
              label="Jabatan"
              fullWidth
              onChange={onChange}
            />
            <TextField
              value={val.alamat}
              multiline
              rows={2}
              maxRows={2}
              sx={{ marginTop: 2 }}
              name="alamat"
              label="Alamat"
              fullWidth
              onChange={onChange}
            />
            <TextField
              value={val.noHp}
              type="number"
              sx={{ marginTop: 2 }}
              name="noHp"
              label="No. Hp"
              fullWidth
              onChange={onChange}
            />
            <TextField
              value={val.latitude}
              sx={{ marginTop: 2 }}
              name="latitude"
              label="latitude"
              fullWidth
              onChange={onChange}
            />
            <TextField
              value={val.longitude}
              type="number"
              sx={{ marginTop: 2 }}
              name="longitude"
              label="longitude"
              fullWidth
              onChange={onChange}
            />
          </Box>

          <LoadingButton
            loading={loading}
            loadingPosition="start"
            fullWidth
            size="large"
            variant="contained"
            onClick={onActionEdit}
          >
            Edit
          </LoadingButton>
        </Box>
      </Modal>

      {/* View Data */}

      <Modal
        open={openView}
        onClose={onCloseView}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleView} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <Typography
            id="modal-modal-title"
            variant="h3"
            sx={{
              mb: 4,
            }}
          >
            View Data
          </Typography>
          <div ref={ref} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <QRCodeCanvas
              id="qr-gen"
              value={`${url}/view-data?id=${selectData.id}`}
              size={250}
              // bgColor={'#ffffff'}
              // fgColor={'#000000'}
              level={'L'}
              includeMargin
              // imageSettings={{
              //   src: 'https://static.zpao.com/favicon.png',
              //   x: undefined,
              //   y: undefined,
              //   height: 24,
              //   width: 24,
              //   excavate: true,
              // }}
              style={{
                marginBottom: 24,
              }}
            />
          </div>

          <Button sx={{ mb: 2 }} onClick={downloadQRCode}>
            Print QRCode
          </Button>
          <Box>
            <Typography variant="body1">Nama Lengkap: &nbsp;{selectData.namaLengkap}</Typography>
            <Typography variant="body1">Jabatan: &nbsp;{selectData.jabatan}</Typography>
            <Typography variant="body1">Alamat: &nbsp;{selectData.alamat}</Typography>
            <Typography variant="body1">No.Hp: &nbsp;{selectData.noHp}</Typography>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
