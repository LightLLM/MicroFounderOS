declare module '@raindrop-studios/liquidmetal-smartcomponents' {
	export class SmartBuckets {
		constructor(opts?: any);
		upload(opts?: any): Promise<void>;
		download(opts?: any): Promise<any>;
		list(opts?: any): Promise<string[]>;
		delete(opts?: any): Promise<void>;
		getMetadata(opts?: any): Promise<Record<string, any> | null>;
	}

	export class SmartMemory {
		constructor(opts?: any);
		read(opts?: any): Promise<any>;
		write(opts?: any): Promise<void>;
		append?(...args: any[]): Promise<void>;
		delete(opts?: any): Promise<void>;
		list(opts?: any): Promise<string[]>;
	}

	export class SmartInference {
		constructor(opts?: any);
		generate(opts?: any): Promise<{ text?: string; content?: string }>;
		chat(opts?: any): Promise<{ text?: string; content?: string }>;
	}

	export class SmartSQL {
		constructor(opts?: any);
		query(opts?: any): Promise<any[]>;
		execute(opts?: any): Promise<{ rowsAffected: number }>;
	}

	const _default: {
		SmartBuckets: typeof SmartBuckets;
		SmartMemory: typeof SmartMemory;
		SmartInference: typeof SmartInference;
		SmartSQL: typeof SmartSQL;
	};

	export default _default;
}
