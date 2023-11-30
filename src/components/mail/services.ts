import ejs, { Data } from "ejs";

export class MailServices {
  static getEJSTemplate(path: string, data?: Data): string {
    return ejs.render(path, { ...(data || {}) });
  }
}
