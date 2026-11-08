using System.ComponentModel.DataAnnotations;

namespace Keldrith.Auth.Api.Dtos.Auth;

public sealed class RegisterRequest : IValidatableObject
{
    [Required(ErrorMessage = "Username is required.")]
    public string Username { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
    public string Password { get; init; } = string.Empty;

    // Validate the trimmed values because the API contract trims username and email.
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var username = Username.Trim();
        if (username.Length is < 3 or > 20)
            yield return new ValidationResult(
                "Username must be between 3 and 20 characters.", [nameof(Username)]);

        var email = Email.Trim();
        if (email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
            yield return new ValidationResult(
                "Email must be a valid email address.", [nameof(Email)]);
    }
}
