import React from 'react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  return (
    <div className='max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-2xl font-bold mb-6'>设置</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-1'>
          <nav className='space-y-1'>
            <button className='w-full px-3 py-2 text-left text-sm font-medium text-purple-700 bg-purple-100 rounded-md'>
              个人信息
            </button>
            <button className='w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md'>
              账号安全
            </button>
            <button className='w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md'>
              通知设置
            </button>
            <button className='w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md'>
              隐私设置
            </button>
          </nav>
        </div>
        <div className='md:col-span-2'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h2 className='text-lg font-semibold mb-4'>个人信息</h2>
            <form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>用户名</label>
                <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500' value='测试用户' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>邮箱</label>
                <input type='email' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500' value='test@example.com' />
              </div>
              <div className='pt-4'>
                <button type='submit' className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md'>
                  保存更改
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
