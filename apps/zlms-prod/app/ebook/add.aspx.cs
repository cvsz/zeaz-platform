using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace lms.ebook
{
    public partial class _add : System.Web.UI.Page
    {
        private static readonly string[] AllowedPdfExtensions = { ".pdf" };
        private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png" };
        private const int MaxPdfBytes = 20 * 1024 * 1024;
        private const int MaxCoverBytes = 5 * 1024 * 1024;
        private const string EbookUploadVirtualPath = "~/App_Data/ebook_assets/";

        protected void Page_Load(object sender, EventArgs e)
        {
            AppLogger.FormEvent(this, System.Reflection.MethodBase.GetCurrentMethod().Name);
        }

        protected void Button1_Click(object sender, EventArgs e)
        {

        }

        protected void Button2_Click(object sender, EventArgs e)
        {

        }

        protected void UploadButton_Click(object sender, EventArgs e)
        {
            AppLogger.FormEvent(this, System.Reflection.MethodBase.GetCurrentMethod().Name);
            string savedPdfFileName = string.Empty;
            string savedCoverFileName = string.Empty;

            if (PdfUploadControl.HasFile)
            {
                try
                {
                    string extension = Path.GetExtension(PdfUploadControl.FileName);
                    if (!AllowedPdfExtensions.Contains((extension ?? string.Empty).ToLowerInvariant()))
                    {
                        RejectUpload("Upload status: Only PDF files are accepted.");
                        return;
                    }

                    if (PdfUploadControl.PostedFile.ContentLength <= 0 || PdfUploadControl.PostedFile.ContentLength > MaxPdfBytes)
                    {
                        RejectUpload("Upload status: Invalid PDF file size.");
                        return;
                    }
                    if (!IsAllowedMime(PdfUploadControl.PostedFile.ContentType, "application/pdf") || !HasPdfSignature(PdfUploadControl.PostedFile))
                    {
                        RejectUpload("Upload status: Invalid PDF content.");
                        return;
                    }

                    savedPdfFileName = Guid.NewGuid().ToString("N") + extension.ToLowerInvariant();
                    SaveEbookFile(PdfUploadControl.PostedFile, savedPdfFileName);
                    StatusLabel.Text = "Upload status: File uploaded!";
                }
                catch (Exception ex)
                {
                    AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
                    StatusLabel.Text = AppLogger.SafeErrorMessage();
                    return;
                }
            }

            if (CoverUploadControl.HasFile)
            {
                try
                {
                    string extension = Path.GetExtension(CoverUploadControl.FileName);
                    if (!AllowedImageExtensions.Contains((extension ?? string.Empty).ToLowerInvariant()))
                    {
                        RejectUpload("Upload status: Cover must be a JPG or PNG file.");
                        return;
                    }

                    if (CoverUploadControl.PostedFile.ContentLength <= 0 || CoverUploadControl.PostedFile.ContentLength > MaxCoverBytes)
                    {
                        RejectUpload("Upload status: Invalid cover file size.");
                        return;
                    }
                    if (!IsAllowedImageMime(CoverUploadControl.PostedFile.ContentType, extension) || !HasImageSignature(CoverUploadControl.PostedFile, extension))
                    {
                        RejectUpload("Upload status: Invalid cover image content.");
                        return;
                    }

                    savedCoverFileName = Guid.NewGuid().ToString("N") + extension.ToLowerInvariant();
                    SaveEbookFile(CoverUploadControl.PostedFile, savedCoverFileName);
                }
                catch (Exception ex)
                {
                    AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, ex);
                    StatusLabel.Text = AppLogger.SafeErrorMessage();
                    return;
                }
            }

            //rapid insert
            SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["cdas_conn"].ConnectionString);
            connection.Open();
            string cmdText = "INSERT INTO [dbo].[ebook] ([title],[author],[isbn],[thumbnail],[filename],[published_date])VALUES (@title,@author,@isbn,@thumbnail,@filename,@published_date)";
            SqlCommand sqlCommand = new SqlCommand(cmdText, connection);
            sqlCommand.CommandText = cmdText;
            sqlCommand.Parameters.AddWithValue("@title", (object)txttitle.Value);
            sqlCommand.Parameters.AddWithValue("@author", (object)txtauthor.Value);
            sqlCommand.Parameters.AddWithValue("@isbn", (object)"");
            sqlCommand.Parameters.AddWithValue("@thumbnail", (object)savedCoverFileName);
            sqlCommand.Parameters.AddWithValue("@filename", (object)savedPdfFileName);
            sqlCommand.Parameters.AddWithValue("@published_date", (object)DateTime.Now);
            sqlCommand.ExecuteNonQuery();
            sqlCommand.Dispose();
            connection.Close();
            Response.Redirect("~/ebook/");
            //end rapid insert

        }


        private void RejectUpload(string message)
        {
            Response.StatusCode = 400;
            StatusLabel.Text = message;
            AppLogger.FormError(this, System.Reflection.MethodBase.GetCurrentMethod().Name, new InvalidOperationException("invalid_upload"));
        }

        private static bool IsAllowedMime(string actualMimeType, string expectedMimeType)
        {
            return string.Equals((actualMimeType ?? string.Empty).Trim(), expectedMimeType, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsAllowedImageMime(string actualMimeType, string extension)
        {
            string normalizedExtension = (extension ?? string.Empty).ToLowerInvariant();
            if (normalizedExtension == ".jpg" || normalizedExtension == ".jpeg")
            {
                return IsAllowedMime(actualMimeType, "image/jpeg");
            }
            return normalizedExtension == ".png" && IsAllowedMime(actualMimeType, "image/png");
        }

        private static bool HasPdfSignature(HttpPostedFile file)
        {
            byte[] header = ReadHeader(file, 5);
            return header.Length == 5 && header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46 && header[4] == 0x2D;
        }

        private static bool HasImageSignature(HttpPostedFile file, string extension)
        {
            byte[] header = ReadHeader(file, 8);
            string normalizedExtension = (extension ?? string.Empty).ToLowerInvariant();
            if (normalizedExtension == ".png")
            {
                return header.Length >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
            }
            return (normalizedExtension == ".jpg" || normalizedExtension == ".jpeg") && header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
        }

        private static byte[] ReadHeader(HttpPostedFile file, int byteCount)
        {
            byte[] header = new byte[byteCount];
            Stream stream = file.InputStream;
            long originalPosition = stream.CanSeek ? stream.Position : 0;
            if (stream.CanSeek)
            {
                stream.Position = 0;
            }
            int bytesRead = stream.Read(header, 0, byteCount);
            if (stream.CanSeek)
            {
                stream.Position = originalPosition;
            }
            if (bytesRead == byteCount)
            {
                return header;
            }
            byte[] resized = new byte[bytesRead];
            Array.Copy(header, resized, bytesRead);
            return resized;
        }

        private static void SaveEbookFile(HttpPostedFile file, string fileName)
        {
            string uploadRoot = HttpContext.Current.Server.MapPath(EbookUploadVirtualPath);
            Directory.CreateDirectory(uploadRoot);
            string fullPath = Path.GetFullPath(Path.Combine(uploadRoot, Path.GetFileName(fileName)));
            if (!fullPath.StartsWith(Path.GetFullPath(uploadRoot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Upload path validation failed.");
            }
            file.SaveAs(fullPath);
        }


    }
}
