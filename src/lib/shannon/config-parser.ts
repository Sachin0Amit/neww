/**
 * Shannon - Config Parser
 * Parses and validates YAML/JSON scan configurations
 */

import yaml from 'js-yaml';
import {
  type Config,
  type DistributedConfig,
  type VulnClass,
  type Rule,
  ALL_VULN_CLASSES,
  ErrorCode,
} from './types';
import { PentestError } from './error-handling';
import { ok, err, type Result } from './types';

/**
 * Parse a YAML or JSON string into a Config object.
 */
export function parseConfig(configString: string): Result<Config, PentestError> {
  try {
    let parsed: unknown;
    const trimmed = configString.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsed = JSON.parse(trimmed);
    } else {
      parsed = yaml.load(trimmed);
    }

    if (!parsed || typeof parsed !== 'object') {
      return err(new PentestError('Config must be a valid object', 'config', false, {}, ErrorCode.CONFIG_PARSE_ERROR));
    }

    const config = parsed as Config;
    const validationError = validateConfig(config);
    if (validationError) {
      return err(validationError);
    }

    return ok(config);
  } catch (e) {
    return err(new PentestError(
      `Failed to parse config: ${e instanceof Error ? e.message : String(e)}`,
      'config',
      false,
      {},
      ErrorCode.CONFIG_PARSE_ERROR,
    ));
  }
}

/**
 * Validate a Config object.
 * At least one steering field must be present.
 */
export function validateConfig(config: Config): PentestError | null {
  const steeringFields: (keyof Config)[] = [
    'authentication', 'rules', 'description', 'vuln_classes', 'exploit', 'report', 'rules_of_engagement',
  ];

  const hasSteeringField = steeringFields.some(field => config[field] !== undefined);
  if (!hasSteeringField) {
    return new PentestError(
      'Config must have at least one steering field: authentication, rules, description, vuln_classes, exploit, report, or rules_of_engagement',
      'config',
      false,
      {},
      ErrorCode.CONFIG_VALIDATION_FAILED,
    );
  }

  // Validate vuln_classes
  if (config.vuln_classes) {
    for (const cls of config.vuln_classes) {
      if (!ALL_VULN_CLASSES.includes(cls)) {
        return new PentestError(
          `Invalid vuln_class: ${cls}. Must be one of: ${ALL_VULN_CLASSES.join(', ')}`,
          'config',
          false,
          { invalidClass: cls },
          ErrorCode.CONFIG_VALIDATION_FAILED,
        );
      }
    }
  }

  // Validate authentication
  if (config.authentication) {
    const auth = config.authentication;
    if (!auth.login_url) {
      return new PentestError(
        'Authentication login_url is required',
        'config',
        false,
        {},
        ErrorCode.CONFIG_VALIDATION_FAILED,
      );
    }
    if (!auth.credentials?.username) {
      return new PentestError(
        'Authentication credentials.username is required',
        'config',
        false,
        {},
        ErrorCode.CONFIG_VALIDATION_FAILED,
      );
    }
  }

  // Validate rules
  if (config.rules) {
    const validRuleTypes = ['url_path', 'subdomain', 'domain', 'method', 'header', 'parameter', 'code_path'];
    const allRules: Rule[] = [...(config.rules.avoid || []), ...(config.rules.focus || [])];
    for (const rule of allRules) {
      if (!validRuleTypes.includes(rule.type)) {
        return new PentestError(
          `Invalid rule type: ${rule.type}. Must be one of: ${validRuleTypes.join(', ')}`,
          'config',
          false,
          {},
          ErrorCode.CONFIG_VALIDATION_FAILED,
        );
      }
    }
  }

  return null;
}

/**
 * Create a DistributedConfig from a user Config.
 * Fills in defaults for missing fields.
 */
export function distributeConfig(config: Config): DistributedConfig {
  return {
    avoid: config.rules?.avoid || [],
    focus: config.rules?.focus || [],
    authentication: config.authentication || null,
    description: config.description || '',
    vuln_classes: config.vuln_classes || [...ALL_VULN_CLASSES],
    exploit: config.exploit !== 'false',
    report: config.report || {},
    rules_of_engagement: config.rules_of_engagement || '',
  };
}

/**
 * Generate a YAML config string from a Config object.
 */
export function configToYaml(config: Config): string {
  return yaml.dump(config, { indent: 2, lineWidth: 120, noRefs: true });
}
