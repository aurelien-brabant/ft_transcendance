import { SetStateAction, useEffect, useRef, useState } from "react";
import { PulseLoader } from "react-spinners";

export type ProgressiveFormField = {
	name: string;
	inputType: "text" | "password";
	placeholder?: string;
	initialValue?: string;
	label?: string;
	validate?: (currentFieldValue: string, fields: any) => string | undefined; // return a string describing the error if any, or nothing if no error
	shouldBeReset?: boolean;
};

export type ProgressiveFormStep = {
	fields: ProgressiveFormField[];
	submitCta: string;
};

export type ProgressiveFormConfig = {
	steps: ProgressiveFormStep[];
};

export const defaultConfig: ProgressiveFormConfig = {
	steps: [
		{
			fields: [
				{
					label: "email",
					name: "email",
					inputType: "text",
					placeholder: "example@gmail.com",
					validate: (value) =>
						value.length > 5 ? "Invalid email address" : undefined,
				},
			],
			submitCta: "Continue with email",
		},
		{
			fields: [
				{
					label: "password",
					name: "password",
					inputType: "password",
				},
			],
			submitCta: "Continue with password",
		},
		{
			fields: [
				{
					label: "password1",
					name: "password1",
					inputType: "password",
				},

				{
					label: "password2",
					name: "password2",
					inputType: "password",
				},
			],
			submitCta: "Continue with password",
		},
	],
};

const getFieldNamesThatShouldBeReset = (config: ProgressiveFormConfig): string[] => {
	const fieldNames: string[] = [];

	for (const step of config.steps) {
		for (const field of step.fields) {
			if (field.shouldBeReset) {
				fieldNames.push(field.name)
			}
		}
	}

	return fieldNames;
}

const initializeFields = (
	config: ProgressiveFormConfig
): { [key: string]: string } => {
	const data: any = {};

	for (const step of config.steps) {
		for (const field of step.fields) {
			if (data[field.name]) {
				console.error(
					"Found duplicated field name while initializing ProgressiveForm fields."
				);
			}
			data[field.name] = field.initialValue || "";
		}
	}

	return data;
};

export type ProgressiveFormProps = {
	config: ProgressiveFormConfig;
	className?: string; // style applied to the form HTML element itself
	submitClassName?: string;
	inputClassName?: string;
	invalidInputClassName?: string;
	invalidInputBoxClassName: string;
	inputGroupClassName?: string;
	inputBoxClassName?: string;
	onSubmit: (formData: any) => void;
	isLoading?: boolean;
	loaderColor?: string;
	reset?: boolean;
	setReset?: React.Dispatch<SetStateAction<boolean>>;
};

const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
	config,
	onSubmit: onFinalSubmit,
	className,
	inputClassName,
	submitClassName,
	inputGroupClassName,
	invalidInputClassName,
	inputBoxClassName,
	invalidInputBoxClassName,
	isLoading,
	loaderColor,
	reset,
	setReset
}) => {
	const [formData, setFormData] = useState(initializeFields(config));
	const [currentStep, setCurrentStep] = useState(0);
	const [invalidInputs, setInvalidInputs] = useState<{
		[key: string]: string | undefined;
	}>({});
	const inputToFocus = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (reset && setReset) {
			const fieldNamesThatShouldBeReset = getFieldNamesThatShouldBeReset(config);
			setCurrentStep(0)
			setFormData({
				...formData,
				...(fieldNamesThatShouldBeReset.reduce((acc, fieldName) => ({
					...acc,
					[fieldName]: ''
				}), {}))
			})
			setReset(false)
		}
	}, [reset])

	useEffect(() => {
		inputToFocus.current?.focus();
	}, [currentStep]);

	const validateFields = (): boolean => {
		const errors: any = {};

		for (const field of config.steps[currentStep].fields) {
			if (!field.validate) {
				continue;
			}

			const error = field.validate(formData[field.name], formData);

			if (error) {
				errors[field.name] = error;
			}
		}

		setInvalidInputs(errors);

		return Object.keys(errors).length === 0;
	};

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateFields()) {
			return;
		}

		if (currentStep === config.steps.length - 1) {
			onFinalSubmit(formData);
		} else {
			setCurrentStep(currentStep + 1);
		}
	};

	const renderInputs = () =>
		config.steps[currentStep].fields.map((field, index) => {
			const isInvalid = !!invalidInputs[field.name];

			return (
				<div className={inputGroupClassName} key={field.name}>
					{field.label && (
						<label htmlFor={field.name}>{field.label}</label>
					)}
					<div
						className={`${inputBoxClassName} ${
							isInvalid ? invalidInputBoxClassName || "" : ""
						} `}
					>
						<input
							autoComplete="off"
							className={inputClassName}
							style={{
								width: "100%",
								backgroundColor: "inherit",
								outline: "none",
							}}
							onKeyDown={(e) => {
								if (currentStep > 0 && e.key === "Escape")
									setCurrentStep(currentStep - 1);
							}}
							ref={index === 0 ? inputToFocus : null}
							type={field.inputType}
							placeholder={field.placeholder}
							name={field.name}
							value={formData[field.name]}
							onChange={(e) => {
								if (invalidInputs[field.name]) {
									setInvalidInputs({
										...invalidInputs,
										[field.name]: undefined,
									});
								}
								setFormData({
									...formData,
									[e.target.name]: e.target.value,
								});
							}}
						/>
						{isInvalid && (
							<p className={invalidInputClassName}>
								{invalidInputs[field.name]}
							</p>
						)}
					</div>
				</div>
			);
		});

	return (
		<form className={className} onSubmit={handleFormSubmit}>
			{renderInputs()}
			<button type="submit" className={submitClassName}>
				{isLoading ? <PulseLoader color={loaderColor} /> : config.steps[currentStep].submitCta}
			</button>
		</form>
	);
};

ProgressiveForm.defaultProps = {
	isLoading: false
};

export default ProgressiveForm;
