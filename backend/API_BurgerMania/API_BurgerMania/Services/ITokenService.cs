namespace API_BurgerMania.Services
{
    public interface ITokenService
    {
        string GenerateToken(string mobileNumber);
    }
}
