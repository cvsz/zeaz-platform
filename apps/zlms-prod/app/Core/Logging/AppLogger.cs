using System;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.UI;

public static class AppLogger
{
    private static readonly TraceSource Trace = new TraceSource("zlms.forms");
    private static readonly Regex SensitiveKeyPattern = new Regex("password|passwd|pwd|token|secret|key|email|phone|mobile|ssn|passport|national|national[_ -]?id|citizen[_ -]?id|address|name|author|title|isbn", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    public static void FormEvent(Page page, string method)
    {
        if (page != null && string.Equals(method, "Page_Load", StringComparison.OrdinalIgnoreCase) && !page.IsPostBack)
        {
            return;
        }

        OrderedDictionary fields = BuildBaseFields(page, method, null);
        fields["action"] = "submit";
        fields["result"] = "success";
        Write("info", "form.submit", fields);
    }

    public static void FormError(Page page, string method, Exception exception)
    {
        OrderedDictionary fields = BuildBaseFields(page, method, null);
        fields["action"] = "submit";
        fields["result"] = "failure";
        fields["error_type"] = exception == null ? "validation_error" : exception.GetType().Name;
        fields["exceptionType"] = exception == null ? string.Empty : exception.GetType().FullName;
        fields["exceptionMessage"] = exception == null ? string.Empty : Redact(exception.Message);
        fields["stackTrace"] = exception == null ? string.Empty : Redact(exception.StackTrace);
        Write("error", "form.error", fields);
    }

    public static void Audit(Page page, string action)
    {
        OrderedDictionary fields = BuildBaseFields(page, action, "admin");
        fields["audit"] = "true";
        Write("info", "audit.admin_action", fields);
    }

    public static string SafeErrorMessage()
    {
        return "An unexpected error occurred while processing this form. Please try again or contact support.";
    }

    public static string Redact(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        string redacted = Regex.Replace(value, @"(?i)(password|passwd|pwd|token|secret|api[_-]?key|access[_-]?key)\s*[:=]\s*[^\s,;&]+", "$1=[REDACTED]");
        redacted = Regex.Replace(redacted, @"(?i)(email|phone|mobile|ssn|passport|national[_ -]?id|citizen[_ -]?id|address)\s*[:=]\s*[^\s,;&]+", "$1=[REDACTED]");
        return redacted;
    }

    private static OrderedDictionary BuildBaseFields(Page page, string method, string area)
    {
        HttpContext context = HttpContext.Current;
        OrderedDictionary fields = new OrderedDictionary();
        fields["timestamp"] = DateTimeOffset.UtcNow.ToString("O");
        fields["form_name"] = page == null ? string.Empty : page.GetType().FullName;
        fields["form"] = fields["form_name"];
        fields["user_id"] = Hash(GetUserName(context));
        fields["method"] = method ?? string.Empty;
        fields["area"] = area ?? string.Empty;
        fields["path"] = context == null || context.Request == null ? string.Empty : context.Request.AppRelativeCurrentExecutionFilePath;
        fields["httpMethod"] = context == null || context.Request == null ? string.Empty : context.Request.HttpMethod;
        fields["traceId"] = GetTraceId(context);
        fields["userHash"] = fields["user_id"];
        fields["sessionHash"] = Hash(context == null || context.Session == null ? string.Empty : context.Session.SessionID);
        fields["fieldNames"] = SafeFieldNames(context == null || context.Request == null ? null : context.Request.Form);
        return fields;
    }

    private static void Write(string level, string eventName, OrderedDictionary fields)
    {
        fields["level"] = level;
        fields["event"] = eventName;
        StringBuilder payload = new StringBuilder();
        payload.Append("{");
        bool first = true;
        foreach (string key in fields.Keys)
        {
            if (!first)
            {
                payload.Append(",");
            }
            first = false;
            payload.Append('"').Append(JsonEscape(key)).Append("\":\"").Append(JsonEscape(Convert.ToString(fields[key]))).Append('"');
        }
        payload.Append("}");

        Trace.TraceEvent(string.Equals(level, "error", StringComparison.OrdinalIgnoreCase) ? TraceEventType.Error : TraceEventType.Information, 0, payload.ToString());
        Trace.Flush();
    }

    private static string SafeFieldNames(NameValueCollection form)
    {
        if (form == null || form.Count == 0)
        {
            return string.Empty;
        }

        StringBuilder builder = new StringBuilder();
        foreach (string key in form.AllKeys)
        {
            if (string.IsNullOrEmpty(key))
            {
                continue;
            }
            if (builder.Length > 0)
            {
                builder.Append(",");
            }
            builder.Append(SensitiveKeyPattern.IsMatch(key) ? "[REDACTED]" : key);
        }
        return builder.ToString();
    }

    private static string GetTraceId(HttpContext context)
    {
        if (context == null)
        {
            return string.Empty;
        }

        const string itemKey = "zlms.trace_id";
        string existing = context.Items[itemKey] as string;
        if (!string.IsNullOrEmpty(existing))
        {
            return existing;
        }

        string traceId = Guid.NewGuid().ToString("N");
        context.Items[itemKey] = traceId;
        if (context.Response != null)
        {
            context.Response.Headers["Trace-Id"] = traceId;
        }
        return traceId;
    }

    private static string GetUserName(HttpContext context)
    {
        if (context == null || context.User == null || context.User.Identity == null || !context.User.Identity.IsAuthenticated)
        {
            return string.Empty;
        }
        return context.User.Identity.Name;
    }

    private static string Hash(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        using (SHA256 sha = SHA256.Create())
        {
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(value));
            StringBuilder builder = new StringBuilder(bytes.Length * 2);
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
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
