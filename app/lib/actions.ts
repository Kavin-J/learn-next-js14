'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  // z.string().nonempty().min(2, {message: 'Must be at least 2 characters'})
  id: z.string(),
  customerId: z.string().nonempty('Please select a customer.'),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an number greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  };
  console.log(rawFormData);

  const validatedFields = CreateInvoice.safeParse(rawFormData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  /** for Mock if you need to use real data comment this  and uncommment below statement*/
  // const date = new Date(
  //   generateRandomDate(new Date('2023-01-26'), new Date('2024-01-26')),
  // )
  //   .toISOString()
  //   .split('T')[0];
  /* for real data */

  //////////////////////
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    return {
      message: 'Database Error : Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function editInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  };
  const validatedFields = CreateInvoice.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await sql` UPDATE INVOICES
      SET CUSTOMER_ID = ${customerId} , AMOUNT = ${amountInCents} , STATUS = ${status} 
      WHERE ID = ${id}
    `;
  } catch (error) {
    return {
      message: 'Database Error : Failed to Update Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // Test Error
  // throw new Error('Falied to Delete Invoice.')

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    return {
      message: 'Database Error : Failed to Delete Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong';
      }
    }
    throw error;
  }
}
