namespace Poker.Api.Models;

public enum EstimationScale
{
    Fibonacci,
    ModifiedFibonacci,
    TShirt,
    PowersOf2
}

public static class EstimationScaleExtensions
{
    private static readonly Dictionary<EstimationScale, string[]> ScaleCards = new()
    {
        [EstimationScale.Fibonacci] = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "?", "☕"],
        [EstimationScale.ModifiedFibonacci] = ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "☕"],
        [EstimationScale.TShirt] = ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"],
        [EstimationScale.PowersOf2] = ["1", "2", "4", "8", "16", "32", "64", "?", "☕"]
    };

    public static string[] GetCards(this EstimationScale scale)
    {
        return ScaleCards[scale];
    }

    public static string ToDisplayString(this EstimationScale scale)
    {
        return scale switch
        {
            EstimationScale.Fibonacci => "fibonacci",
            EstimationScale.ModifiedFibonacci => "modifiedFibonacci",
            EstimationScale.TShirt => "tshirt",
            EstimationScale.PowersOf2 => "powersOf2",
            _ => scale.ToString().ToLowerInvariant()
        };
    }

    public static EstimationScale FromString(string value)
    {
        return value.ToLowerInvariant() switch
        {
            "fibonacci" => EstimationScale.Fibonacci,
            "modifiedfibonacci" => EstimationScale.ModifiedFibonacci,
            "tshirt" => EstimationScale.TShirt,
            "powersof2" => EstimationScale.PowersOf2,
            _ => throw new ArgumentException($"Invalid estimation scale: {value}")
        };
    }
}
