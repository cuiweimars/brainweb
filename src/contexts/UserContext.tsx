﻿import React, { ReactNode } from 'react';

export const UserProvider: React.FC<{ children: ReactNode }> = ({children}) => <>{children}</>;

export const useUser = () => ({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});
