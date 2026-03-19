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
import { useLoginMutation } from '@/store/api';

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must contain at least 6 characters')
    .required('Password is required'),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      await loginMutation(values).unwrap();
      toast.success('Successfully logged in');
      navigate(APP_ROUTES.EVENTS, { replace: true });
    } catch (error) {
      toast.error(
        getServerErrorMessage(error, 'Login failed. Please try again.'),
      );
    }
  };

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
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
                disabled={isSubmitting || isLoginLoading}
              >
                {isSubmitting || isLoginLoading ? 'Logging in...' : 'Login'}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{' '}
                <Link to={APP_ROUTES.REGISTER}>Register here</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginPage;
