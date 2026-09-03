using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace NailSalon.Api.Services;

public class EmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toAddress, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
        {
            _logger.LogWarning("SMTP nu este configurat — emailul către {To} nu a fost trimis.", toAddress);
            return;
        }

        using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword),
            EnableSsl = true
        };

        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromAddress, _settings.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toAddress);

        try
        {
            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trimiterea emailului către {To} a eșuat.", toAddress);
        }
    }
}
