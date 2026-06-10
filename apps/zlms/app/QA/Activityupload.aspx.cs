// Decompiled with JetBrains decompiler
// Type: newweb.QA.Activityupload
// Assembly: newweb, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: A2E847A6-10D0-4271-9D59-55F01CDCC8B0
// Assembly location: C:\data\source-20190227T061536Z-001\source\lms\lms\bin\newweb.dll

using System;
using System.Collections.Specialized;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace newweb.QA
{
  public class Activityupload : Page
  {
    protected HyperLink hyperlink3;

    protected void Page_Load(object sender, EventArgs e)
    {
      string ownerId = (this.Request["ID"] ?? string.Empty).Trim();
      if (!FileUploadSecurity.IsSafeSegment(ownerId))
      {
        this.Response.Redirect("default.aspx");
        return;
      }
      if (!(HttpContext.Current.Request.HttpMethod == "POST"))
        return;
      foreach (string fileKey in (NameObjectCollectionBase) this.Request.Files)
      {
        HttpPostedFile postedFile = this.Request.Files[fileKey];
        SafeUploadResult upload = FileUploadSecurity.Save(postedFile, "~/Activities/", ownerId, string.Empty);
        this.addUser(upload.FileName, upload.DirectoryPath, ownerId);
      }
    }

    private void addUser(string filename, string filepath, string ownerId)
    {
      CConnect cconnect = new CConnect();
      cconnect.sqlCmdText("INSERT INTO QA_activities_file ([ActivitiesID],[FileName],[FilePath],[userid],[CreatedDate],[Updatedate],[Updateby],Active) VALUES(@OwnerId,@FileName,@FilePath,@UserId,@CreatedDate,@Updatedate,@Updateby,@Active)");
      cconnect.sqlCmdAddParam("@OwnerId", ownerId);
      cconnect.sqlCmdAddParam("@FileName", filename);
      cconnect.sqlCmdAddParam("@FilePath", filepath);
      cconnect.sqlCmdAddParam("@UserId", "1");
      cconnect.sqlCmdAddParam("@CreatedDate", DateTime.Now);
      cconnect.sqlCmdAddParam("@Updatedate", DateTime.Now);
      cconnect.sqlCmdAddParam("@Updateby", "1");
      cconnect.sqlCmdAddParam("@Active", "1");
      cconnect.sqlCmd();
    }

    public string renderdata()
    {
      string str1 = (this.Request["ID"] ?? string.Empty).Trim();
      if (!FileUploadSecurity.IsSafeSegment(str1))
        return string.Empty;
      string str2 = "";
      try
      {
        string empty = string.Empty;
        SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString);
        connection.Open();
        string cmdText = "Select [id],[FileName],[FilePath] from QA_activities_file where ActivitiesID=@ClassItemID and active='1'";
        SqlCommand sqlCommand = new SqlCommand(cmdText, connection);
        sqlCommand.CommandText = cmdText;
        sqlCommand.Parameters.AddWithValue("@ClassItemID", (object) str1);
        SqlDataReader sqlDataReader = sqlCommand.ExecuteReader();
        if (sqlDataReader.HasRows)
        {
          while (sqlDataReader.Read())
          {
            int fileId;
            if (!int.TryParse(sqlDataReader.GetValue(0).ToString(), out fileId))
              continue;
            string fileName = sqlDataReader.GetValue(1).ToString();
            string encodedFileName = HttpUtility.HtmlEncode(fileName);
            string href = "/Activities/" + HttpUtility.UrlPathEncode(str1) + "/" + HttpUtility.UrlPathEncode(fileName);
            str2 += "<div class='col-md-8'> ";
            str2 = str2 + "<div class='col-sm-2'><a href='" + href + "' download><span class='pull-right'>" + encodedFileName + "</span></a></div>";
            str2 += "<div class='col-sm-6'>";
            str2 = str2 + "<span class='pull-left'><a class='btn btn-circle btn-danger' onclick='ReGen(" + fileId.ToString() + ")'><i class='fa fa-trash'></i></a></span>";
            str2 += "</div>  <div class='col-sm-4'></div>";
            str2 += "</div> <div class='col-md-4'></div>";
          }
        }
      }
      catch (Exception ex)
            {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
            }
      return str2;
    }

    [WebMethod(EnableSession = true)]
    public static void ReGenToken(string id)
    {
      int fileId;
      if (!int.TryParse(id, out fileId))
        return;
      try
      {
        SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString);
        connection.Open();
        string cmdText = "update [QA_activities_file] set active='0' where id=@id";
        SqlCommand sqlCommand = new SqlCommand(cmdText, connection);
        sqlCommand.CommandText = cmdText;
        sqlCommand.Parameters.AddWithValue("@id", (object) fileId);
        sqlCommand.ExecuteNonQuery();
        sqlCommand.Dispose();
        connection.Close();
      }
      catch (Exception ex)
            {
                AppLogger.FormError(null, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
            }
    }
  }
}
