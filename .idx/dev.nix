# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.nodemon
  ];

  # Sets environment variables in the workspace
  env = {
    # Mongo
    ATLAS_URI="mongodb+srv://chornosae:PI6xXpRnVVQrQ1Ev@maintestcluster.wclyfh2.mongodb.net/?retryWrites=true&w=majority&appName=MainTestCluster";

    # Goolge
    GOOGLE_CLIENT_ID="111395781940-a1qa6knlseh74m4jgnuk9mc67ld59abi.apps.googleusercontent.com";
    GOOGLE_CLIENT_SECRET="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";
    GOOGLE_MAP_KEY="AIzaSyBoGg2dlHxNAB2hkFhn13C7psLV4mWDHRI";
    # GOOGLE_MAP_KEY="AIzaSyATI1RftxJdljtMM5TH9CxgoNuN2mplyeo";
    JWT_SECRET="thisisajwtsecret";

    # Mail Chimp
    MAILCHIMP_API_KEY="md-b6qefC-y1JM6et6YP32Ijw";
    HOST_EMAIL="wash@gourmadelaundry.com";

    #Gengeral
    BUSINESS_WEBSITE="http://localhost:3000/";
    SESSION_SECRET="thisisasessionsecret";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
        #   # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
        #   # and show it in IDX's web preview panel
          command = ["npm" "run" "dev"];
          manager = "web";
          env = {
            # Environment variables to set for your server
            PORT = "$PORT";
          };
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Example: install JS dependencies from NPM
        npm-install = "npm install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example: start a background task to watch and re-build backend code
        watch-backend = "npm run watch-backend";
      };
    };
  };
}
