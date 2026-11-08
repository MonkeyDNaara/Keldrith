using System.ComponentModel.DataAnnotations;

namespace Keldrith.Auth.Api.Dtos.Auth;

public sealed class LoginRequest : IValidatableObject
{
    [Required(ErrorMessage = "Email is required.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; init; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var email = Email.Trim();
        if (!new EmailAddressAttribute().IsValid(email))
            yield return new ValidationResult(
                "Email must be a valid email address.", [nameof(Email)]);
    }
}
