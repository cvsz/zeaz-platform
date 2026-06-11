using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace newweb
{
  public class login : Page
  {
    protected HtmlForm form1;
    protected HtmlInputText txtUsername;
    protected HtmlInputPassword txtPassword;
    protected Button bnLogin;
    protected Label Label1;
    protected HtmlInputText emailc;
    protected Button bnAdduser;

    protected void ShowMessage(string Message, login.MessageType type)
    {
      string safeMessage = HttpUtility.JavaScriptStringEncode(Message ?? string.Empty);
      string safeType = HttpUtility.JavaScriptStringEncode(type.ToString());
      ScriptManager.RegisterStartupScript((Page) this, this.GetType(), Guid.NewGuid().ToString(), "ShowMessage('" + safeMessage + "','" + safeType + "');", true);
    }

    protected void Page_Load(object sender, EventArgs e)
    {
      SecurityTelemetry.BeginRequest(HttpContext.Current, "login.page_load");
    }

    protected void bnSubmit_Click(object sender, EventArgs e)
    {
      string traceId = SecurityTelemetry.BeginRequest(HttpContext.Current, "login.password_reset.request");
      ScriptManager.RegisterStartupScript((Page) this, this.GetType(), "Pop", "openModal();", true);

      string email = (this.emailc.Value ?? string.Empty).Trim();
      if (!SecurityInputValidator.IsValidEmail(email))
      {
        SecurityTelemetry.Warn("login.password_reset.request", "invalid email format", traceId);
        this.ShowMessage("If the email is registered, password reset instructions will be sent.", login.MessageType.Info);
        return;
      }

      string userId = this.checkUser(email, traceId);
      if (!string.IsNullOrEmpty(userId))
      {
        string resetToken = this.addUser(userId, traceId);
        if (!string.IsNullOrEmpty(resetToken))
        {
          this.SendMail(email, resetToken, traceId);
        }
      }

      this.ShowMessage("If the email is registered, password reset instructions will be sent.", login.MessageType.Info);
    }

    protected bool SendMail(string recipientAddress, string resetToken, string traceId)
    {
      string fromAddress = ConfigurationManager.AppSettings["SmtpFromAddress"];
      if (string.IsNullOrWhiteSpace(fromAddress))
      {
        SecurityTelemetry.Warn("login.password_reset.email", "SMTP sender is not configured", traceId);
        return false;
      }

      try
      {
        using (MailMessage message = new MailMessage())
        using (SmtpClient smtpClient = new SmtpClient())
        {
          message.Subject = "zLMS password reset";
          message.Body = "Use this password reset token to continue your password reset: " + HttpUtility.HtmlEncode(resetToken);
          message.From = new MailAddress(fromAddress);
          message.To.Add(new MailAddress(recipientAddress));
          message.IsBodyHtml = false;
          smtpClient.Send(message);
        }
        SecurityTelemetry.Info("login.password_reset.email", "password reset email queued", traceId);
        return true;
      }
      catch (SmtpException ex)
      {
        SecurityTelemetry.Error("login.password_reset.email", ex, traceId);
        return false;
      }
      catch (InvalidOperationException ex)
      {
        SecurityTelemetry.Error("login.password_reset.email", ex, traceId);
        return false;
      }
      catch (FormatException ex)
      {
        SecurityTelemetry.Error("login.password_reset.email", ex, traceId);
        return false;
      }
    }

    protected string getSaltString()
    {
      const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
      StringBuilder stringBuilder = new StringBuilder(24);
      byte[] randomBytes = new byte[24];
      using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(randomBytes);
      }
      for (int i = 0; i < randomBytes.Length; i++)
      {
        stringBuilder.Append(alphabet[randomBytes[i] % alphabet.Length]);
      }
      return stringBuilder.ToString();
    }

    private string checkUser(string email, string traceId)
    {
      const string sql = "select [id] from [Member] where [email]=@EMAIL and [active]='1'";
      try
      {
        using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString))
        using (SqlCommand command = new SqlCommand(sql, connection))
        {
          command.CommandType = CommandType.Text;
          command.Parameters.Add("@EMAIL", SqlDbType.NVarChar, 254).Value = email;
          connection.Open();
          object result = command.ExecuteScalar();
          return result == null || result == DBNull.Value ? string.Empty : Convert.ToString(result);
        }
      }
      catch (SqlException ex)
      {
        SecurityTelemetry.Error("login.password_reset.lookup", ex, traceId);
        return string.Empty;
      }
    }

    private string addUser(string userId, string traceId)
    {
      const string sql = "INSERT INTO [Forgetpass] ([userid],[Saltcheck],[Active],[Createdate]) VALUES(@USERID,@TOKEN,'1',@CREATEDATE)";
      string saltString = this.getSaltString();
      try
      {
        using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString))
        using (SqlCommand command = new SqlCommand(sql, connection))
        {
          command.CommandType = CommandType.Text;
          command.Parameters.Add("@USERID", SqlDbType.NVarChar, 64).Value = userId;
          command.Parameters.Add("@TOKEN", SqlDbType.NVarChar, 64).Value = saltString;
          command.Parameters.Add("@CREATEDATE", SqlDbType.DateTime).Value = DateTime.UtcNow;
          connection.Open();
          command.ExecuteNonQuery();
        }
        SecurityTelemetry.Info("login.password_reset.token", "password reset token created", traceId);
        return saltString;
      }
      catch (SqlException ex)
      {
        SecurityTelemetry.Error("login.password_reset.token", ex, traceId);
        return string.Empty;
      }
    }

    protected void bnLogin_Click(object sender, EventArgs e)
    {
      this.checkLogin();
    }

    private string checkLogin()
    {
      string traceId = SecurityTelemetry.BeginRequest(HttpContext.Current, "login.authenticate");
      string userName = (this.txtUsername.Value ?? string.Empty).Trim();
      string password = this.txtPassword.Value ?? string.Empty;

      if (!SecurityInputValidator.IsValidUserName(userName) || !SecurityInputValidator.IsValidPassword(password))
      {
        SecurityTelemetry.Warn("login.authenticate", "invalid credential input", traceId);
        this.ShowMessage("Invalid username or password.", login.MessageType.Error);
        return string.Empty;
      }

      if (!LoginRateLimiter.IsAllowed(HttpContext.Current, userName, traceId))
      {
        this.ShowMessage("Too many failed login attempts. Please wait and try again.", login.MessageType.Warning);
        return string.Empty;
      }

      const string cmdText = "select [Name],[Rank],[ID],[userinlist] from [Member] where [username]=@NAME and [password]=@PASSWORD and [active]='1'";
      try
      {
        using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString))
        using (SqlCommand sqlCommand = new SqlCommand(cmdText, connection))
        {
          sqlCommand.CommandType = CommandType.Text;
          sqlCommand.Parameters.Add("@NAME", SqlDbType.NVarChar, 128).Value = userName;
          sqlCommand.Parameters.Add("@PASSWORD", SqlDbType.NVarChar, 256).Value = password;
          connection.Open();
          using (SqlDataReader sqlDataReader = sqlCommand.ExecuteReader(CommandBehavior.SingleRow))
          {
            if (sqlDataReader.Read())
            {
              LoginRateLimiter.Reset(HttpContext.Current, userName);
              this.Session.Clear();
              this.Session["SessionID"] = Guid.NewGuid().ToString("N");
              this.Session["IDX"] = Convert.ToString(sqlDataReader.GetValue(2));
              this.Session["FULLNAME"] = Convert.ToString(sqlDataReader.GetValue(0));
              this.Session["RANK"] = Convert.ToString(sqlDataReader.GetValue(1));
              this.Session["group"] = Convert.ToString(sqlDataReader.GetValue(3));
              SecurityTelemetry.Info("login.authenticate", "authentication succeeded", traceId);
              this.Response.Redirect("Default.aspx", false);
              this.Context.ApplicationInstance.CompleteRequest();
              return string.Empty;
            }
          }
        }
        SecurityTelemetry.Warn("login.authenticate", "authentication failed", traceId);
        this.ShowMessage("Invalid username or password.", login.MessageType.Error);
      }
      catch (SqlException ex)
      {
        SecurityTelemetry.Error("login.authenticate", ex, traceId);
        this.ShowMessage("Login is temporarily unavailable. Please try again later.", login.MessageType.Error);
      }
      return string.Empty;
    }

    public enum MessageType
    {
      Success,
      Error,
      Info,
      Warning,
    }
  }
}
