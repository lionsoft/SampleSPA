using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Sam.Extensions.ErrorManager;

namespace Sam.Extensions
{
    public static class MailService
    {
        static MailService()
        {
            // Disable client validation of the server sertificate
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };            
        }
        public async static Task SendMailAsync(string from, IEnumerable<string> mailto, string subject, string message, string attachFile = null)
        {
            using (var mail = new MailMessage {From = new MailAddress(from)})
            using (var client = new SmtpClient { DeliveryFormat = SmtpDeliveryFormat.International })
            {
                client.Host = ConfigurationManager.AppSettings.Get("smtp.host") ?? client.Host;
                client.Port = Convert.ToInt32(ConfigurationManager.AppSettings.Get("smtp.port") ?? client.Port.ToString());
                client.Timeout = Convert.ToInt32(ConfigurationManager.AppSettings.Get("smtp.timeout") ?? client.Timeout.ToString());

                var enableSsl = ConfigurationManager.AppSettings.Get("smtp.enableSSL");
                if (enableSsl.IsNotEmpty())
                    client.EnableSsl = enableSsl.ToLower() == "true" || enableSsl == "1";
                var smtpUser = ConfigurationManager.AppSettings.Get("smtp.userName");
                var smtpPassword = ConfigurationManager.AppSettings.Get("smtp.password");
                if (smtpUser != null && smtpPassword != null)
                    client.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                foreach (var email in mailto.Union(new[] { ConfigurationManager.AppSettings.Get("smtp.administrator") }).Where(x => x.IsNotEmpty()))
                {
                    if (mail.To.Count == 0)
                        mail.To.Add(new MailAddress(email));
                    mail.Bcc.Add(new MailAddress(email));
                }
                mail.Subject = subject;
                mail.Body = message;
                mail.SubjectEncoding = Encoding.UTF8;
                mail.BodyEncoding = Encoding.UTF8;
                if (!string.IsNullOrEmpty(attachFile))
                    mail.Attachments.Add(new Attachment(attachFile));
                await client.SendMailAsync(mail);
            }
        }
    }
}