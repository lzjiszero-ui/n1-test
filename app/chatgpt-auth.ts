import { headers } from 'next/headers';

export type ChatGPTUser = {
  userId: string;
  email: string;
};

/**
 * 读取托管平台已经验证过的登录身份。
 * 验证码由平台发送和校验，本站只会收到稳定的用户编号与邮箱地址。
 */
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get('oai-authenticated-user-id');
  const email = requestHeaders.get('oai-authenticated-user-email');
  return userId && email ? { userId, email } : null;
}
