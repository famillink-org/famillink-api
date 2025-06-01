export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  content?: string;
}

export interface IEmailsProvider {
  sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<EmailResponse>;
}
