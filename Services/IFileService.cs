using Microsoft.AspNetCore.Http;

namespace FarmerConsumerAPI.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folder, string userId);
        void DeleteFile(string filePath);
        bool IsValidImageType(string contentType);
        bool IsValidDocumentType(string contentType);
        bool IsValidFileSize(long size, long maxSizeInBytes = 5 * 1024 * 1024);
    }
}
