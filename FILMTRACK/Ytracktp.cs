using System;
using System.Collections.Generic;

public class Recette
{
    private string _nom;
    private string _ingredients;
    private int _tempsPreparation;
    private decimal _cout;

    public string Nom 
    { 
        get { return _nom; } 
        set { _nom = value; } 
    }

    public string Ingredients 
    { 
        get { return _ingredients; } 
        set { _ingredients = value; } 
    }

    public int TempsPreparation 
    { 
        get { return _tempsPreparation; } 
        set { _tempsPreparation = value; } 
    }

    public decimal Cout 
    { 
        get { return _cout; } 
        set { _cout = value; } 
    }

    public Recette(string nom, string ingredients, int temps, decimal cout)
    {
        _nom = nom;
        _ingredients = ingredients;
        _tempsPreparation = temps;
        _cout = cout;
    }

    public virtual void AfficherRecette()
    {
        Console.WriteLine("=== RECETTE ===");
        Console.WriteLine($"Nom: {_nom}");
        Console.WriteLine($"Ingrédients: {_ingredients}");
        Console.WriteLine($"Temps de préparation: {_tempsPreparation} minutes");
        Console.WriteLine($"Coût: {_cout:C}");
    }

    public decimal CalculerCout()
    {
        return _cout;
    }
}

public class RecetteDessert : Recette
{
    private bool _contientSucre;

    public bool ContientSucre 
    { 
        get { return _contientSucre; } 
        set { _contientSucre = value; } 
    }

    public RecetteDessert(string nom, string ingredients, int temps, decimal cout, bool sucre) 
        : base(nom, ingredients, temps, cout)
    {
        _contientSucre = sucre;
    }

    public override void AfficherRecette()
    {
        base.AfficherRecette();
        Console.WriteLine($"Contient du sucre: {(_contientSucre ? "Oui" : "Non")}");
        Console.WriteLine("Type: DESSERT");
    }
}

public class RecettePlatPrincipal : Recette
{
    private string _typeDePlat;

    public string TypeDePlat 
    { 
        get { return _typeDePlat; } 
        set { _typeDePlat = value; } 
    }

    public RecettePlatPrincipal(string nom, string ingredients, int temps, decimal cout, string typeDePlat) 
        : base(nom, ingredients, temps, cout)
    {
        _typeDePlat = typeDePlat;
    }

    public override void AfficherRecette()
    {
        base.AfficherRecette();
        Console.WriteLine($"Type de plat: {_typeDePlat} (Viande, Poisson ou Végétarien)");
        Console.WriteLine("Type: PLAT PRINCIPAL");
    }
}

public class LivreRecettes
{
    private List<Recette> _recettes;

    public LivreRecettes()
    {
        _recettes = new List<Recette>();
    }

    public void AjouterRecette(Recette recette)
    {
        _recettes.Add(recette);
        Console.WriteLine($"✓ Recette '{recette.Nom}' ajoutée avec succès!");
    }

    public void AfficherToutesRecettes()
    {
        if (_recettes.Count == 0)
        {
            Console.WriteLine("Aucune recette dans le livre.\n");
            return;
        }

        Console.WriteLine($"\n=== {_recettes.Count} RECETTES ===\n");
        foreach (var recette in _recettes)
        {
            recette.AfficherRecette();
            Console.WriteLine();
        }
    }

    public decimal CalculerCoutTotal()
    {
        decimal total = 0;
        foreach (var recette in _recettes)
        {
            total += recette.CalculerCout();
        }
        return total;
    }

    public void AfficherCoutTotal()
    {
        decimal total = CalculerCoutTotal();
        Console.WriteLine($"Coût total de toutes les recettes: {total:C}\n");
    }
}

public class Program
{
    public static void Main()
    {
        LivreRecettes livre = new LivreRecettes();

        Console.WriteLine("=== LIVRE DE RECETTES ===\n");

        while (true)
        {
            Console.WriteLine("Menu:");
            Console.WriteLine("1 - Ajouter une recette");
            Console.WriteLine("2 - Afficher toutes les recettes");
            Console.WriteLine("3 - Afficher le coût total");
            Console.WriteLine("4 - Quitter");
            Console.Write("\nChoisissez une option: ");

            string choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    AjouterRecette(livre);
                    break;
                case "2":
                    livre.AfficherToutesRecettes();
                    break;
                case "3":
                    livre.AfficherCoutTotal();
                    break;
                case "4":
                    Console.WriteLine("Au revoir!");
                    return;
                default:
                    Console.WriteLine("Option invalide.\n");
                    break;
            }
        }
    }

    public static void AjouterRecette(LivreRecettes livre)
    {
        Console.WriteLine("\nChoisissez le type de recette:");
        Console.WriteLine("1 - Dessert");
        Console.WriteLine("2 - Plat Principal");
        Console.Write("Type: ");

        string type = Console.ReadLine();

        Console.Write("Nom de la recette: ");
        string nom = Console.ReadLine();

        Console.Write("Ingrédients (séparés par des virgules): ");
        string ingredients = Console.ReadLine();

        Console.Write("Temps de préparation (minutes): ");
        int temps = int.Parse(Console.ReadLine());

        Console.Write("Coût (€): ");
        decimal cout = decimal.Parse(Console.ReadLine());

        if (type == "1")
        {
            Console.Write("Contient du sucre? (oui/non): ");
            bool sucre = Console.ReadLine().ToLower() == "oui";
            livre.AjouterRecette(new RecetteDessert(nom, ingredients, temps, cout, sucre));
        }
        else if (type == "2")
        {
            Console.Write("Type de plat (Viande/Poisson/Végétarien): ");
            string typeDePlat = Console.ReadLine();
            livre.AjouterRecette(new RecettePlatPrincipal(nom, ingredients, temps, cout, typeDePlat));
        }
        else
        {
            Console.WriteLine("Type invalide.\n");
        }
    }
} 
