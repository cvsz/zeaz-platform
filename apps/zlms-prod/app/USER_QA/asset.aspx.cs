// Decompiled with JetBrains decompiler
// Type: newweb.USER_QA.asset
// Assembly: newweb, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: A2E847A6-10D0-4271-9D59-55F01CDCC8B0
// Assembly location: C:\data\source-20190227T061536Z-001\source\lms\lms\bin\newweb.dll

using System;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace newweb.USER_QA
{
  public class asset : Page
  {
    protected HtmlGenericControl rpBody;
    protected GridView gvDP;
    protected HtmlGenericControl rpFooter;
    protected SqlDataSource sqlDP;
    protected Button Button1;

    protected void Page_Load(object sender, EventArgs e)
    {
      if (this.IsPostBack)
        return;
      try
      {
        this.sqlDP.SelectParameters[0].DefaultValue = this.Request["ID"].ToString();
        this.sqlDP.DataBind();
        try
        {
          this.gvDP.DataBind();
        }
        catch (Exception ex)
            {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
            }
      }
      catch (Exception ex)
      {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
        string message = AppLogger.SafeErrorMessage();
      }
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
      this.addUser1();
      for (int index = 0; index < this.gvDP.Rows.Count; ++index)
      {
        string text = ((TextBox) this.gvDP.Rows[index].FindControl("TextBox1")).Text;
        int num = index + 1;
        this.addUser(((Label) this.gvDP.Rows[index].FindControl("Label2")).Text, text);
      }
    }

    private void addUser1()
    {
      CConnect cconnect = new CConnect();
      string str = "";
      try
      {
        str = this.Request["ID"].ToString();
      }
      catch (Exception ex)
            {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
            }
      string sql = "delete QA_result1 where Projectid=@ProjectId";
      cconnect.sqlCmd(sql, "@ProjectId", str);
    }

    private void addUser(string filename, string filepath)
    {
      CConnect cconnect = new CConnect();
      string str = "";
      try
      {
        str = this.Request["ID"].ToString();
      }
      catch (Exception ex)
            {
                AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
            }
      string sql = "INSERT INTO QA_result1 ([Projectid],[standard_detail_id],[Score],[Createdate]) VALUES(@ProjectId,@StandardDetailId,@Score,@Createdate)";
      cconnect.sqlCmd(sql, "@ProjectId", str, "@StandardDetailId", filename, "@Score", filepath, "@Createdate", DateTime.Now);
    }

    protected void gv1_PreRender(object sender, EventArgs e)
    {
      this.MergeGridviewRows(this.gvDP);
    }

    private void MergeGridviewRows(GridView gridView)
    {
      for (int index = gridView.Rows.Count - 2; index >= 0; --index)
      {
        GridViewRow row1 = gridView.Rows[index];
        GridViewRow row2 = gridView.Rows[index + 1];
        if (row1.Cells[0].Text == row2.Cells[0].Text)
        {
          row1.Cells[0].RowSpan = row2.Cells[0].RowSpan < 2 ? 2 : row2.Cells[0].RowSpan + 1;
          row2.Cells[0].Visible = false;
        }
        if (row1.Cells[1].Text == row2.Cells[1].Text)
        {
          row1.Cells[1].RowSpan = row2.Cells[1].RowSpan < 2 ? 2 : row2.Cells[1].RowSpan + 1;
          row2.Cells[1].Visible = false;
        }
      }
    }
  }
}
