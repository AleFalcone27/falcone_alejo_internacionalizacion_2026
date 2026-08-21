import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private serviceId = "service_r6upqgr";
  private templateId = "";
  private publicKey = "XMRuuLjUPKSf-ULZ3";

  async enviarCorreoCuentaAprobada(data: { name: string; to_email: string }) {
    this.templateId = "template_ar0d0s7";
    const templateParams = {
      name: data.name,
      to_email: data.to_email,
    };

    await emailjs.send(this.serviceId, this.templateId, templateParams, this.publicKey);
  }

  async enviarCorreoCuentaRechazada(data: { name: string; to_email: string }) {
    this.templateId = "template_6dcfbmq";
    const templateParams = {
      name: data.name,
      to_email: data.to_email,
    };

    await emailjs.send(this.serviceId, this.templateId, templateParams, this.publicKey);
  }

}
