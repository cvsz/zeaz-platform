// Decompiled with JetBrains decompiler
// Type: newweb.Certificate.Certificatedetail
// Assembly: newweb, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: A2E847A6-10D0-4271-9D59-55F01CDCC8B0
// Assembly location: C:\data\source-20190227T061536Z-001\source\lms\lms\bin\newweb.dll

using DevExpress.XtraReports.Web;
using System;
using System.IO;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace newweb.Certificate
{
  public class Certificatedetail : Page
  {
    protected HyperLink HyperLink1;
    protected ASPxDocumentViewer ASPxDocumentViewer1;

    protected void Page_Load(object sender, EventArgs e)
    {
      string message;
      try
      {
        message = this.Request["ID"].ToString();
        string str = HttpContext.Current.Server.MapPath("~/Cerfile/");
        if (message != "")
        {
          string path = FileUploadSecurity.EnsureSafeDirectory("~/Cerfile/", message);
          string templatePath = Path.GetFullPath(Path.Combine(str, "DEBIT.repx"));
          string targetPath = Path.GetFullPath(Path.Combine(path, "DEBIT.repx"));
          if (!File.Exists(targetPath))
            File.Copy(templatePath, targetPath);
        }
      }
      catch (Exception ex)
      {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
        SecurityTelemetry.Warn("certificate.detail", AppLogger.Redact(ex.Message), string.Empty);
        message = string.Empty;
      }
      this.HyperLink1.NavigateUrl = "Certificate_adjust.aspx?id=" + HttpUtility.UrlEncode(message);
    }
  }
}
