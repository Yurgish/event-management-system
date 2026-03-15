import { yupResolver } from '@hookform/resolvers/yup';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { APP_ROUTES } from '@/constants/routes';
import { getServerErrorMessage } from '@/lib/server-error';
import { useRegisterMutation } from '@/store/api';

const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(5, 'Name must contain at least 5 characters')
    .max(30, 'Name must contain at most 30 characters')
    .required('Name is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must contain at least 6 characters')
    .max(30, 'Password must contain at most 30 characters')
    .required('Password is required'),
});

type RegisterFormValues = yup.InferType<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    try {
      await registerMutation(values).unwrap();
      toast.success('Account created successfully');
      navigate(APP_ROUTES.EVENTS, { replace: true });
    } catch (error) {
      toast.error(
        getServerErrorMessage(error, 'Registration failed. Please try again.'),
      );
    }
  };

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-xl">Register</CardTitle>
        <CardDescription className="text-center">
          Create your account to start managing events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isRegisterLoading}
              >
                {isSubmitting || isRegisterLoading
                  ? 'Creating account...'
                  : 'Create account'}
              </Button>
              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link to={APP_ROUTES.LOGIN}>Login here</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterPage;
