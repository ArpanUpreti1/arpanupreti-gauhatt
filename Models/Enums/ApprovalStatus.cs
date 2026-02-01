namespace FarmerConsumerAPI.Models.Enums
{
    public enum ApprovalStatus
    {
        NotApplicable = 0,  // For consumers and admins
        Pending = 1,        // Awaiting admin approval
        Approved = 2,       // Admin approved
        Rejected = 3        // Admin rejected
    }
}
