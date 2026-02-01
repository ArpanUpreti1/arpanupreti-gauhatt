using Microsoft.AspNetCore.Http;

namespace FarmerConsumerAPI.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileService> _logger;
        private readonly string[] _allowedImageTypes = { "image/jpeg", "image/png", "image/jpg" };
        private readonly string[] _allowedDocumentTypes = { "image/jpeg", "image/png", "image/jpg", "application/pdf" };

        public FileService(IWebHostEnvironment environment, ILogger<FileService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folder, string userId)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null");
            }

            // Create directory if it doesn't exist
            var uploadPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", folder);
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Generate unique filename
            var timestamp = DateTime.UtcNow.Ticks;
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{userId}_{timestamp}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation("File saved: {FilePath}", filePath);

            // Return relative URL path
            return $"/uploads/{folder}/{fileName}";
        }

        public void DeleteFile(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return;
            }

            var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, filePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {FilePath}", fullPath);
            }
        }

        public bool IsValidImageType(string contentType)
        {
            return _allowedImageTypes.Contains(contentType.ToLowerInvariant());
        }

        public bool IsValidDocumentType(string contentType)
        {
            return _allowedDocumentTypes.Contains(contentType.ToLowerInvariant());
        }

        public bool IsValidFileSize(long size, long maxSizeInBytes = 5 * 1024 * 1024)
        {
            return size <= maxSizeInBytes;
        }
    }
}
