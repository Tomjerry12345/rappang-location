import { Box, Card, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/FirebaseServices';

const ViewData = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({});

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const docRef = doc(db, 'users', searchParams.get('id'));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
      setData(docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!');
    }
  };

  const onLocation = () => {
    console.log('onLocation');
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     const lat = position.coords.latitude;
    //     const long = position.coords.longitude;

    //     console.log(position);

    //     window.location.href = `https://www.google.com/maps/dir/?api=1&origin=${lat},${long}&destination=${data.latitude},${data.longitude}`;
    //   },
    //   (error) => {
    //     console.error(`Error Code = ${error.code} - ${error.message}`);
    //   }
    // );
  };

  const onHubungi = () => {
    window.location.href = `tel: +62${data.noHp}`
  }

  return (
    <Box
      sx={{
        height: '100%',
      }}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card
        sx={{
          width: 250,

          p: 4,
        }}
      >
        <Box
          justifyContent="center"
          display="flex"
          sx={{
            mb: 4,
          }}
        >
          <Typography variant="h6">Data Lengkap</Typography>
        </Box>
        {Object.keys(data).length > 0 ? (
          <>
            <Typography sx={{ mb: 1 }} variant="body1">
              Nama lengkap: &nbsp;{data.namaLengkap}
            </Typography>
            <Typography sx={{ mb: 1 }} variant="body1">
              Jabatan: &nbsp;{data.jabatan}
            </Typography>
            <Typography sx={{ mb: 1 }} variant="body1">
              Alamat: &nbsp;{data.alamat}
            </Typography>
            <Typography variant="body1">No.Hp: &nbsp;{data.noHp}</Typography>

            <Box
              display="flex"
              sx={{
                mt: 2,
              }}
              justifyContent="space-between"
            >
              <Button onClick={onLocation}>Lihat lokasi</Button>
              <Button onClick={onHubungi}>Hubungi</Button>
            </Box>
          </>
        ) : (
          <Box display="flex" justifyContent="center">
            <Typography>No Data</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default ViewData;
