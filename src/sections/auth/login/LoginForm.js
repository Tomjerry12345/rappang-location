import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components

import { doc, getDoc } from 'firebase/firestore';

import { db } from '../../../services/FirebaseServices';

import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [val, setVal] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setVal({
      ...val,
      [name]: value,
    });
  };

  const handleClick = async (e) => {
    // console.log('val', val);
    setLoading(true)
    const docRef = doc(db, 'admin', 'admin');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('docSnap.data()', data);
      if (data.username === val.username && data.password === val.password) {
        navigate('/dashboard', { replace: true });
      } else {
        alert('username / password salah');
      }

      setLoading(false)
      
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="username" label="Username" onChange={handleChange}/>

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack> */}

      <LoadingButton loading={loading} sx={{ my: 4 }} fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
