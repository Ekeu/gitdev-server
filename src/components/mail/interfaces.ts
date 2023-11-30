export interface IEmailJob {
  value: {
    to: string;
    subject: string;
    html: string;
  };
}
