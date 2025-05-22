# Load AWS PowerShell module
Import-Module AWSPowerShell

# Set parameters
$stackName = "wordle-stack"
$environment = "dev"
$templatePath = "infrastructure\wordle-infrastructure.yaml"

# Get the template content
$templateContent = Get-Content $templatePath -Raw

# Create the stack
New-CFNStack -StackName $stackName -TemplateBody $templateContent -Parameters @{
    ParameterKey = "Environment";
    ParameterValue = $environment
} -Capabilities "CAPABILITY_NAMED_IAM"
