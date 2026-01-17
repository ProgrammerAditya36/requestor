// Helper to resolve {{VAR}} syntax
export function resolveTemplate(
	text: string | undefined,
	variables: Record<string, string>
  ): string {
	if (!text) return ''
  
	return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
	  return variables[varName] ?? match // Keep {{VAR}} if not found
	})
  }
  
  export function resolveTemplateObject(
	obj: Record<string, string> | undefined,
	variables: Record<string, string>
  ): Record<string, string> {
	if (!obj) return {}
  
	const resolved: Record<string, string> = {}
	for (const [key, value] of Object.entries(obj)) {
	  resolved[key] = resolveTemplate(value, variables)
	}
	return resolved
  }