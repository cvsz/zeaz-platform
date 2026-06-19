// Decompiled with JetBrains decompiler
// Type: newweb.USER_QA.Uploadfile1
// Assembly: newweb, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: A2E847A6-10D0-4271-9D59-55F01CDCC8B0
// Assembly location: C:\data\source-20190227T061536Z-001\source\lms\lms\bin\newweb.dll

using System;
using System.Collections.Specialized;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace newweb.USER_QA
{
  public class Uploadfile1 : Page
  {
    protected Label Label1;
    protected HtmlForm test;
    protected Button Button77;

    protected void Page_Load(object sender, EventArgs e)
    {
      string standardId = (this.Request["ID"] ?? string.Empty).Trim();
      string fileNumber = (this.Request["IDx"] ?? string.Empty).Trim();
      if (!FileUploadSecurity.IsSafeSegment(standardId) || !FileUploadSecurity.IsSafeSegment(fileNumber))
      {
        this.Response.Redirect("default.aspx");
        return;
      }
      this.coursename1(standardId);
      int num = this.IsPostBack ? 1 : 0;
      if (!(HttpContext.Current.Request.HttpMethod == "POST"))
        return;
      foreach (string fileKey in (NameObjectCollectionBase) this.Request.Files)
      {
        HttpPostedFile postedFile = this.Request.Files[fileKey];
        string prefix = this.coursename(standardId);
        SafeUploadResult upload = FileUploadSecurity.Save(postedFile, "~/QAFILE1/", standardId, prefix);
        this.addUser(upload.FileName, upload.DirectoryPath, standardId, fileNumber);
      }
    }

    private string coursename1(string classid)
    {
      string str = "";
      SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString);
      connection.Open();
      string cmdText = "select Standard_detail,qi.projectid from [QA_standard_detail] qde  inner join QA_standard qsd on qsd.id=qde.Standardid inner join QA_Indicator qi on qsd.qaindicator=qi.id where qde.id=@id";
      SqlCommand sqlCommand = new SqlCommand(cmdText, connection);
      sqlCommand.CommandText = cmdText;
      sqlCommand.Parameters.AddWithValue("@id", (object) classid);
      SqlDataReader sqlDataReader = sqlCommand.ExecuteReader();
      if (sqlDataReader.HasRows)
      {
        sqlDataReader.Read();
        this.Label1.Text = sqlDataReader.GetValue(0).ToString();
      }
      sqlDataReader.Close();
      sqlCommand.Dispose();
      connection.Close();
      return str;
    }

    private void addUser(string filename, string filepath, string stdid, string dt1_1)
    {
      CConnect cconnect = new CConnect();
      cconnect.sqlCmdText("INSERT INTO QA_main_result_file1 ([Standardid],[file1],[FilePath],[Createdate],[Createby],Active,fileno) VALUES(@StandardId,@FileName,@FilePath,@Createdate,@Createby,@Active,@FileNo)");
      cconnect.sqlCmdAddParam("@StandardId", stdid);
      cconnect.sqlCmdAddParam("@FileName", filename);
      cconnect.sqlCmdAddParam("@FilePath", filepath);
      cconnect.sqlCmdAddParam("@Createdate", DateTime.Now);
      cconnect.sqlCmdAddParam("@Createby", "1");
      cconnect.sqlCmdAddParam("@Active", "1");
      cconnect.sqlCmdAddParam("@FileNo", dt1_1);
      cconnect.sqlCmd();
    }

    public string coursename(string classid)
    {
      string str = "1";
      SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString);
      connection.Open();
      string cmdText = "select count(id) from [QA_main_result_file1] where Standardid=@id";
      SqlCommand sqlCommand = new SqlCommand(cmdText, connection);
      sqlCommand.CommandText = cmdText;
      sqlCommand.Parameters.AddWithValue("@id", (object) classid);
      SqlDataReader sqlDataReader = sqlCommand.ExecuteReader();
      if (sqlDataReader.HasRows)
      {
        sqlDataReader.Read();
        str = (int.Parse(sqlDataReader.GetValue(0).ToString()) + 1).ToString();
      }
      sqlDataReader.Close();
      sqlCommand.Dispose();
      connection.Close();
      return str;
    }
  }
}
