import ejs, { Data } from "ejs";

export class MailServices {
  static async getEJSTemplate(path: string, data?: Data): Promise<string> {
    return await ejs.renderFile(path, { ...(data || {}) });
  }
}
