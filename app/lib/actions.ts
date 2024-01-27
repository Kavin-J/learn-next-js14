'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

//Mock   generate Date Func
function generateRandomDate(from: Date, to: Date): Date {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime()),
  );
}

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  };

  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
  const amountInCents = amount * 100;
  /** for Mock if you need to use real data comment this  and uncommment below statement*/
  // const date = new Date(
  //   generateRandomDate(new Date('2023-01-26'), new Date('2024-01-26')),
  // )
  //   .toISOString()
  //   .split('T')[0];
  /* for real data */

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

export async function editInvoice(id: string, formData: FormData) {
  console.log(id);
  console.log(formData);

  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  };
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
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
