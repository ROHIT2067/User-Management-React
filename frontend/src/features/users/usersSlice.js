import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: "",
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    updateUser: (state, action) => {
      state.users = state.users.map((user) =>
        user._id === action.payload.id ? { ...user, ...action.payload.userData } : user
      );
    },
  },
});

export const {
  setUsers,
  setLoading,
  setError,
  deleteUser,
  setSelectedUser,
  clearSelectedUser,
  updateUser,
} = usersSlice.actions;

export const selectUsers = (state) => state.users.users;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUserById = (state, userId) =>
  state.users.users.find((user) => user._id === userId);

export default usersSlice.reducer;
