using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.UI;

namespace newweb
{
    internal static class SecurityTelemetry
    {
        private static readonly TraceSource Trace = new TraceSource("zlms.security");

        public static string BeginRequest(HttpContext context, string operationName)
        {
            string traceId = GetOrCreateTraceId(context);
            Write("info", operationName, "started", traceId, null);
            if (context != null && context.Response != null)
            {
                context.Response.Headers["Trace-Id"] = traceId;
            }
            return traceId;
        }

        public static void Info(string operationName, string message, string traceId)
        {
            Write("info", operationName, message, traceId, null);
        }

        public static void Warn(string operationName, string message, string traceId)
        {
            Write("warn", operationName, message, traceId, null);
        }

        public static void Error(string operationName, Exception exception, string traceId)
        {
            Write("error", operationName, exception == null ? "unknown" : exception.GetType().FullName, traceId, exception);
        }

        private static void Write(string level, string operationName, string message, string traceId, Exception exception)
        {
            string safeMessage = JsonEscape(message);
            string safeOperation = JsonEscape(operationName);
            string safeTraceId = JsonEscape(traceId);
            string payload = string.Format(
                "{{\"timestamp\":\"{0:O}\",\"level\":\"{1}\",\"operation\":\"{2}\",\"traceId\":\"{3}\",\"message\":\"{4}\"{5}}}",
                DateTimeOffset.UtcNow,
                level,
                safeOperation,
                safeTraceId,
                safeMessage,
                exception == null ? string.Empty : string.Format(",\"exception\":\"{0}\"", JsonEscape(exception.Message)));
            Trace.TraceEvent(ToEventType(level), 0, payload);
            Trace.Flush();
        }

        private static TraceEventType ToEventType(string level)
        {
            if (string.Equals(level, "error", StringComparison.OrdinalIgnoreCase))
            {
                return TraceEventType.Error;
            }
            if (string.Equals(level, "warn", StringComparison.OrdinalIgnoreCase))
            {
                return TraceEventType.Warning;
            }
            return TraceEventType.Information;
        }

        private static string GetOrCreateTraceId(HttpContext context)
        {
            if (context != null && context.Request != null)
            {
                string traceParent = context.Request.Headers["traceparent"];
                string parsedTraceId = ParseTraceParent(traceParent);
                if (!string.IsNullOrEmpty(parsedTraceId))
                {
                    return parsedTraceId;
                }
            }
            byte[] bytes = new byte[16];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return ToHex(bytes);
        }

        private static string ParseTraceParent(string traceParent)
        {
            if (string.IsNullOrWhiteSpace(traceParent))
            {
                return string.Empty;
            }
            string[] parts = traceParent.Split('-');
            if (parts.Length < 4)
            {
                return string.Empty;
            }
            string traceId = parts[1];
            if (Regex.IsMatch(traceId, "\\A[0-9a-f]{32}\\z", RegexOptions.CultureInvariant))
            {
                return traceId;
            }
            return string.Empty;
        }

        private static string ToHex(byte[] bytes)
        {
            char[] chars = new char[bytes.Length * 2];
            const string alphabet = "0123456789abcdef";
            for (int i = 0; i < bytes.Length; i++)
            {
                chars[i * 2] = alphabet[bytes[i] >> 4];
                chars[(i * 2) + 1] = alphabet[bytes[i] & 0x0F];
            }
            return new string(chars);
        }

        private static string JsonEscape(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n");
        }
    }


    internal static class AuthorizationSecurity
    {
        public static bool RequireAuthenticated(Page page)
        {
            if (page == null || page.Session == null || page.Session["SessionID"] == null)
            {
                RedirectToLogin(page);
                return false;
            }
            return true;
        }

        public static bool RequireRole(Page page, string role)
        {
            if (!RequireAuthenticated(page))
            {
                return false;
            }
            if (!IsInRole(page, role))
            {
                SecurityTelemetry.Warn("authorization.role", "forbidden", SecurityTelemetry.BeginRequest(HttpContext.Current, "authorization.role"));
                page.Response.Redirect(page.ResolveUrl("~/Default.aspx"), false);
                page.Context.ApplicationInstance.CompleteRequest();
                return false;
            }
            return true;
        }

        private static bool IsInRole(Page page, string role)
        {
            string expectedRole = (role ?? string.Empty).Trim();
            string sessionRole = Convert.ToString(page.Session["Role"]);
            if (string.Equals(sessionRole, expectedRole, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            string rank = Convert.ToString(page.Session["RANK"]);
            if (string.Equals(expectedRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return string.Equals(rank, "Admin", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(rank, "1", StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }

        private static void RedirectToLogin(Page page)
        {
            if (page == null || page.Response == null)
            {
                return;
            }
            page.Response.Redirect(page.ResolveUrl("~/web/"), false);
            page.Context.ApplicationInstance.CompleteRequest();
        }
    }

    internal static class LoginRateLimiter
    {
        public static bool IsAllowed(HttpContext context, string userName, string traceId)
        {
            int limit = ReadPositiveInt("LoginRateLimitMaxAttempts", 5);
            int windowMinutes = ReadPositiveInt("LoginRateLimitWindowMinutes", 15);
            string key = "login-rate:" + Sha256Hex(GetClientAddress(context) + ":" + NormalizeUserName(userName));
            object current = HttpRuntime.Cache[key];
            int attempts = current == null ? 0 : Convert.ToInt32(current);
            if (attempts >= limit)
            {
                SecurityTelemetry.Warn("login.rate_limit", "rate limit exceeded", traceId);
                return false;
            }
            HttpRuntime.Cache.Insert(
                key,
                attempts + 1,
                null,
                DateTime.UtcNow.AddMinutes(windowMinutes),
                System.Web.Caching.Cache.NoSlidingExpiration);
            return true;
        }

        public static void Reset(HttpContext context, string userName)
        {
            string key = "login-rate:" + Sha256Hex(GetClientAddress(context) + ":" + NormalizeUserName(userName));
            HttpRuntime.Cache.Remove(key);
        }

        private static int ReadPositiveInt(string appSettingName, int defaultValue)
        {
            int parsed;
            string configuredValue = ConfigurationManager.AppSettings[appSettingName];
            if (int.TryParse(configuredValue, out parsed) && parsed > 0)
            {
                return parsed;
            }
            return defaultValue;
        }

        private static string NormalizeUserName(string userName)
        {
            return (userName ?? string.Empty).Trim().ToUpperInvariant();
        }

        private static string GetClientAddress(HttpContext context)
        {
            if (context == null || context.Request == null || context.Request.UserHostAddress == null)
            {
                return "unknown";
            }
            return context.Request.UserHostAddress;
        }

        private static string Sha256Hex(string value)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(value ?? string.Empty));
                StringBuilder builder = new StringBuilder(bytes.Length * 2);
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }


    internal sealed class SafeUploadResult
    {
        public string FileName { get; private set; }
        public string FullPath { get; private set; }
        public string DirectoryPath { get; private set; }

        public SafeUploadResult(string fileName, string fullPath, string directoryPath)
        {
            FileName = fileName;
            FullPath = fullPath;
            DirectoryPath = directoryPath;
        }
    }

    internal static class FileUploadSecurity
    {
        private const int MaxUploadBytes = 50 * 1024 * 1024;
        private static readonly Regex SafeSegmentPattern = new Regex("\\A[A-Za-z0-9_-]{1,64}\\z", RegexOptions.CultureInvariant);
        private static readonly Regex SafeFileNamePattern = new Regex("[^A-Za-z0-9._-]", RegexOptions.CultureInvariant);
        private static readonly string[] AllowedExtensions = new string[]
        {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".jpg", ".jpeg", ".png", ".gif", ".zip"
        };

        public static bool IsSafeSegment(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && SafeSegmentPattern.IsMatch(value.Trim());
        }

        public static SafeUploadResult Save(HttpPostedFile file, string virtualRoot, string ownerSegment, string fileNamePrefix)
        {
            if (file == null || file.ContentLength <= 0)
            {
                throw new InvalidOperationException("Upload payload is empty.");
            }
            if (file.ContentLength > MaxUploadBytes)
            {
                throw new InvalidOperationException("Upload exceeds the configured size limit.");
            }
            if (!IsSafeSegment(ownerSegment))
            {
                throw new InvalidOperationException("Invalid upload owner identifier.");
            }

            string originalName = Path.GetFileName(file.FileName ?? string.Empty);
            string extension = Path.GetExtension(originalName);
            if (!IsAllowedExtension(extension))
            {
                throw new InvalidOperationException("File type is not allowed.");
            }

            string rootPath = EnsureTrailingSeparator(HttpContext.Current.Server.MapPath(virtualRoot));
            string directoryPath = Path.GetFullPath(Path.Combine(rootPath, ownerSegment));
            if (!directoryPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Upload path validation failed.");
            }

            Directory.CreateDirectory(directoryPath);
            string safeBaseName = SafeFileNamePattern.Replace(Path.GetFileNameWithoutExtension(originalName), "_").Trim(' ', '.', '_');
            if (string.IsNullOrEmpty(safeBaseName))
            {
                safeBaseName = "upload";
            }
            string safePrefix = string.IsNullOrWhiteSpace(fileNamePrefix) ? string.Empty : SafeFileNamePattern.Replace(fileNamePrefix, "_") + "_";
            string fileName = safePrefix + DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmssfff") + "_" + Guid.NewGuid().ToString("N") + "_" + safeBaseName + extension.ToLowerInvariant();
            string fullPath = Path.GetFullPath(Path.Combine(directoryPath, fileName));
            if (!fullPath.StartsWith(directoryPath + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Upload filename validation failed.");
            }

            file.SaveAs(fullPath);
            return new SafeUploadResult(fileName, fullPath, directoryPath);
        }

        public static string EnsureSafeDirectory(string virtualRoot, string ownerSegment)
        {
            if (!IsSafeSegment(ownerSegment))
            {
                throw new InvalidOperationException("Invalid directory owner identifier.");
            }
            string rootPath = EnsureTrailingSeparator(HttpContext.Current.Server.MapPath(virtualRoot));
            string directoryPath = Path.GetFullPath(Path.Combine(rootPath, ownerSegment));
            if (!directoryPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Directory path validation failed.");
            }
            Directory.CreateDirectory(directoryPath);
            return directoryPath;
        }

        private static bool IsAllowedExtension(string extension)
        {
            if (string.IsNullOrWhiteSpace(extension))
            {
                return false;
            }
            for (int i = 0; i < AllowedExtensions.Length; i++)
            {
                if (string.Equals(AllowedExtensions[i], extension, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        private static string EnsureTrailingSeparator(string path)
        {
            string fullPath = Path.GetFullPath(path);
            if (!fullPath.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal))
            {
                fullPath += Path.DirectorySeparatorChar;
            }
            return fullPath;
        }
    }

    internal static class SecurityInputValidator
    {
        private static readonly Regex UserNamePattern = new Regex("\\A[A-Za-z0-9._@-]{1,128}\\z", RegexOptions.CultureInvariant);

        public static bool IsValidUserName(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && UserNamePattern.IsMatch(value.Trim());
        }

        public static bool IsValidPassword(string value)
        {
            return !string.IsNullOrEmpty(value) && value.Length <= 256;
        }

        public static bool IsValidEmail(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > 254)
            {
                return false;
            }
            try
            {
                System.Net.Mail.MailAddress address = new System.Net.Mail.MailAddress(value.Trim());
                return string.Equals(address.Address, value.Trim(), StringComparison.OrdinalIgnoreCase);
            }
            catch (FormatException)
            {
                return false;
            }
        }
    }
}
