import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  donors: [],
  bloodRequests: [],
  camps: [],
  isLoading: false,
};

export const donorSlice = createSlice({
  name: 'donor',
  initialState,
  reducers: {
    setDonors: (state, action) => {
      state.donors = action.payload;
    },
    setBloodRequests: (state, action) => {
      state.bloodRequests = action.payload;
    },
    setCamps: (state, action) => {
      state.camps = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setDonors, setBloodRequests, setCamps, setLoading } = donorSlice.actions;
export default donorSlice.reducer;