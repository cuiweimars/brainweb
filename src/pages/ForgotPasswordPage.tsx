import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className='max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-2xl font-bold text-center mb-6'>��������</h1>
      <p className='mb-4 text-gray-600'>���������������ַ�����ǽ�����������������Ӹ�����</p>
      <form className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>�����ַ</label>
          <input type='email' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500' placeholder='����������' />
        </div>
        <div>
          <button type='submit' className='w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors duration-300'>
            ������������
          </button>
        </div>
      </form>
      <div className='mt-6 text-center'>
        <Link to='/login' className='text-sm text-purple-600 hover:text-purple-500'>
          ���ص�¼
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
